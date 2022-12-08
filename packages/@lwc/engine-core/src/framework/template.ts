/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayIndexOf,
    ArrayUnshift,
    assert,
    create,
    isArray,
    isFunction,
    isNull,
    isTrue,
    isUndefined,
    KEY__SCOPED_CSS,
    toString,
} from '@lwc/shared';

import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';
import api, { RenderAPI } from './api';
import {
    RenderMode,
    resetComponentRoot,
    runWithBoundaryProtection,
    ShadowMode,
    SlotSet,
    TemplateCache,
    VM,
} from './vm';
import { EmptyArray } from './utils';
import { defaultEmptyTemplate, isTemplateRegistered } from './secure-template';
import {
    createStylesheet,
    getStylesheetsContent,
    TemplateStylesheetFactories,
    updateStylesheetToken,
} from './stylesheet';
import { logOperationEnd, logOperationStart, OperationId } from './profiler';
import { getTemplateOrSwappedTemplate, setActiveVM } from './hot-swaps';
import { VNodes } from './vnodes';
import { RendererAPI } from './renderer';

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, cache: TemplateCache): VNodes;

    /** The list of slot names used in the template. */
    slots?: string[];
    /** The stylesheet associated with the template. */
    stylesheets?: TemplateStylesheetFactories;
    /** The string used for synthetic shadow style scoping and light DOM style scoping. */
    stylesheetToken?: string;
    /** Render mode for the template. Could be light or undefined (which means it's shadow) */
    renderMode?: 'light';
    /** True if this template contains template refs, undefined or false otherwise */
    hasRefs?: boolean;
}

export let isUpdatingTemplate: boolean = false;

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}

function validateSlots(vm: VM, html: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const { cmpSlots } = vm;
    const { slots = EmptyArray } = html;

    for (const slotName in cmpSlots.slotAssignments) {
        // eslint-disable-next-line @lwc/lwc-internal/no-production-assert
        assert.isTrue(
            isArray(cmpSlots.slotAssignments[slotName]),
            `Slots can only be set to an array, instead received ${toString(
                cmpSlots.slotAssignments[slotName]
            )} for slot "${slotName}" in ${vm}.`
        );

        if (slotName !== '' && ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO [#1297]: this should never really happen because the compiler should always validate
            // eslint-disable-next-line @lwc/lwc-internal/no-production-assert
            logError(
                `Ignoring unknown provided slot name "${slotName}" in ${vm}. Check for a typo on the slot attribute.`,
                vm
            );
        }
    }
}

function validateLightDomTemplate(template: Template, vm: VM) {
    if (template === defaultEmptyTemplate) return;
    if (vm.renderMode === RenderMode.Light) {
        assert.isTrue(
            template.renderMode === 'light',
            `Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode="light"' directive to the root template tag of ${getComponentTag(
                vm
            )}.`
        );
    } else {
        assert.isTrue(
            isUndefined(template.renderMode),
            `Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive from ${getComponentTag(
                vm
            )} or set it to 'lwc:render-mode="shadow"`
        );
    }
}

const enum FragmentCache {
    HAS_SCOPED_STYLE = 1 << 0,
    SHADOW_MODE_SYNTHETIC = 1 << 1,
}

function buildParseFragmentFn(
    createFragmentFn: (html: string, renderer: RendererAPI) => Element
): (strings: string[], ...keys: number[]) => () => Element {
    return (strings: string[], ...keys: number[]) => {
        const cache = create(null);

        return function (): Element {
            const {
                context: { hasScopedStyles, stylesheetToken },
                shadowMode,
                renderer,
            } = getVMBeingRendered()!;
            const hasStyleToken = !isUndefined(stylesheetToken);
            const isSyntheticShadow = shadowMode === ShadowMode.Synthetic;

            let cacheKey = 0;
            if (hasStyleToken && hasScopedStyles) {
                cacheKey |= FragmentCache.HAS_SCOPED_STYLE;
            }
            if (hasStyleToken && isSyntheticShadow) {
                cacheKey |= FragmentCache.SHADOW_MODE_SYNTHETIC;
            }

            if (!isUndefined(cache[cacheKey])) {
                return cache[cacheKey];
            }

            const classToken = hasScopedStyles && hasStyleToken ? ' ' + stylesheetToken : '';
            const classAttrToken =
                hasScopedStyles && hasStyleToken ? ` class="${stylesheetToken}"` : '';
            const attrToken = hasStyleToken && isSyntheticShadow ? ' ' + stylesheetToken : '';

            let htmlFragment = '';
            for (let i = 0, n = keys.length; i < n; i++) {
                switch (keys[i]) {
                    case 0: // styleToken in existing class attr
                        htmlFragment += strings[i] + classToken;
                        break;
                    case 1: // styleToken for added class attr
                        htmlFragment += strings[i] + classAttrToken;
                        break;
                    case 2: // styleToken as attr
                        htmlFragment += strings[i] + attrToken;
                        break;
                    case 3: // ${1}${2}
                        htmlFragment += strings[i] + classAttrToken + attrToken;
                        break;
                }
            }

            htmlFragment += strings[strings.length - 1];

            cache[cacheKey] = createFragmentFn(htmlFragment, renderer);

            return cache[cacheKey];
        };
    };
}

// Note: at the moment this code executes, we don't have a renderer yet.
export const parseFragment = buildParseFragmentFn((html, renderer) => {
    const { createFragment } = renderer;
    return createFragment(html);
});

export const parseSVGFragment = buildParseFragmentFn((html, renderer) => {
    const { createFragment, getFirstChild } = renderer;
    const fragment = createFragment('<svg>' + html + '</svg>');
    return getFirstChild(fragment);
});

export function evaluateTemplate(vm: VM, html: Template): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isFunction(html),
            `evaluateTemplate() second argument must be an imported template instead of ${toString(
                html
            )}`
        );
        // in dev-mode, we support hot swapping of templates, which means that
        // the component instance might be attempting to use an old version of
        // the template, while internally, we have a replacement for it.
        html = getTemplateOrSwappedTemplate(html);
    }
    const isUpdatingTemplateInception = isUpdatingTemplate;
    const vmOfTemplateBeingUpdatedInception = vmBeingRendered;
    let vnodes: VNodes = [];

    runWithBoundaryProtection(
        vm,
        vm.owner,
        () => {
            // pre
            vmBeingRendered = vm;
            logOperationStart(OperationId.Render, vm);
        },
        () => {
            // job
            const { component, context, cmpSlots, cmpTemplate, tro } = vm;
            tro.observe(() => {
                // Reset the cache memoizer for template when needed.
                if (html !== cmpTemplate) {
                    if (process.env.NODE_ENV !== 'production') {
                        validateLightDomTemplate(html, vm);
                    }

                    // Perf opt: do not reset the shadow root during the first rendering (there is
                    // nothing to reset).
                    if (!isNull(cmpTemplate)) {
                        // It is important to reset the content to avoid reusing similar elements
                        // generated from a different template, because they could have similar IDs,
                        // and snabbdom just rely on the IDs.
                        resetComponentRoot(vm);
                    }

                    // Check that the template was built by the compiler.
                    if (!isTemplateRegistered(html)) {
                        throw new TypeError(
                            `Invalid template returned by the render() method on ${vm}. It must return an imported template (e.g.: \`import html from "./${
                                vm.def.name
                            }.html"\`), instead, it has returned: ${toString(html)}.`
                        );
                    }

                    vm.cmpTemplate = html;

                    // Create a brand new template cache for the swapped templated.
                    context.tplCache = create(null);

                    // Set the computeHasScopedStyles property in the context, to avoid recomputing it repeatedly.
                    context.hasScopedStyles = computeHasScopedStyles(html, vm);

                    // Update the scoping token on the host element.
                    updateStylesheetToken(vm, html);

                    // Evaluate, create stylesheet and cache the produced VNode for future
                    // re-rendering.
                    const stylesheetsContent = getStylesheetsContent(vm, html);
                    context.styleVNodes =
                        stylesheetsContent.length === 0
                            ? null
                            : createStylesheet(vm, stylesheetsContent);
                }

                if (process.env.NODE_ENV !== 'production') {
                    // validating slots in every rendering since the allocated content might change over time
                    validateSlots(vm, html);
                    // add the VM to the list of host VMs that can be re-rendered if html is swapped
                    setActiveVM(vm);
                }

                // reset the refs; they will be set during the tmpl() instantiation
                const hasRefVNodes = Boolean(html.hasRefs);
                vm.hasRefVNodes = hasRefVNodes;
                vm.refVNodes = hasRefVNodes ? create(null) : null;

                // right before producing the vnodes, we clear up all internal references
                // to custom elements from the template.
                vm.velements = [];
                // Set the global flag that template is being updated
                isUpdatingTemplate = true;

                vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);
                const { styleVNodes } = context;
                if (!isNull(styleVNodes)) {
                    ArrayUnshift.apply(vnodes, styleVNodes);
                }
            });
        },
        () => {
            // post
            isUpdatingTemplate = isUpdatingTemplateInception;
            vmBeingRendered = vmOfTemplateBeingUpdatedInception;

            logOperationEnd(OperationId.Render, vm);
        }
    );

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isArray(vnodes),
            `Compiler should produce html functions that always return an array.`
        );
    }
    return vnodes;
}

function computeHasScopedStylesInStylesheets(
    stylesheets: TemplateStylesheetFactories | undefined | null
) {
    if (hasStyles(stylesheets)) {
        for (let i = 0; i < stylesheets.length; i++) {
            if (isTrue((stylesheets[i] as any)[KEY__SCOPED_CSS])) {
                return true;
            }
        }
    }
    return false;
}

export function computeHasScopedStyles(template: Template, vm: VM | undefined): boolean {
    const { stylesheets } = template;
    const vmStylesheets = !isUndefined(vm) ? vm.stylesheets : null;

    return (
        computeHasScopedStylesInStylesheets(stylesheets) ||
        computeHasScopedStylesInStylesheets(vmStylesheets)
    );
}

export function hasStyles(
    stylesheets: TemplateStylesheetFactories | undefined | null
): stylesheets is TemplateStylesheetFactories {
    return !isUndefined(stylesheets) && !isNull(stylesheets) && stylesheets.length > 0;
}
