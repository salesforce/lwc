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
    isUndefined,
    toString,
} from '@lwc/shared';
import { logError } from '../shared/logger';
import { VNode, VNodes } from '../3rdparty/snabbdom/types';
import * as api from './api';
import { RenderAPI } from './api';
import {
    resetComponentRoot,
    runWithBoundaryProtection,
    ShadowMode,
    SlotSet,
    TemplateCache,
    VM,
    RenderMode,
} from './vm';
import { EmptyArray } from './utils';
import { defaultEmptyTemplate, isTemplateRegistered } from './secure-template';
import {
    TemplateStylesheetFactories,
    createStylesheet,
    getStylesheetsContent,
    updateSyntheticShadowAttributes,
} from './stylesheet';
import { logOperationStart, logOperationEnd, OperationId, trackProfilerState } from './profiler';
import { getTemplateOrSwappedTemplate, setActiveVM } from './hot-swaps';

export interface TemplateStylesheetTokens {
    /** HTML attribute that need to be applied to the host element. This attribute is used for
     * the `:host` pseudo class CSS selector. */
    hostAttribute: string;
    /** HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs with synthetic
     * shadow. */
    shadowAttribute: string;
}

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, cache: TemplateCache): VNodes;

    /** The list of slot names used in the template. */
    slots?: string[];
    /** The stylesheet associated with the template. */
    stylesheets?: TemplateStylesheetFactories;
    /** The stylesheet tokens used for synthetic shadow style scoping. */
    stylesheetTokens?: TemplateStylesheetTokens;
    /** Render mode for the template. Could be light or undefined (which means it's shadow) */
    renderMode?: 'light';
}

export let isUpdatingTemplate: boolean = false;

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}

let profilerEnabled = false;
trackProfilerState((t) => (profilerEnabled = t));

function validateSlots(vm: VM, html: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const { cmpSlots } = vm;
    const { slots = EmptyArray } = html;

    for (const slotName in cmpSlots) {
        // eslint-disable-next-line lwc-internal/no-production-assert
        assert.isTrue(
            isArray(cmpSlots[slotName]),
            `Slots can only be set to an array, instead received ${toString(
                cmpSlots[slotName]
            )} for slot "${slotName}" in ${vm}.`
        );

        if (slotName !== '' && ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO [#1297]: this should never really happen because the compiler should always validate
            // eslint-disable-next-line lwc-internal/no-production-assert
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
            `Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode="light"' directive on the root template tag.`
        );
    } else {
        assert.isTrue(
            isUndefined(template.renderMode),
            `Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive or set it to 'lwc:render-mode="shadow"`
        );
    }
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode | null> {
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
            if (profilerEnabled) {
                logOperationStart(OperationId.render, vm);
            }
        },
        () => {
            // job
            const { component, context, cmpSlots, cmpTemplate, tro, shadowMode } = vm;
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

                    // Update the synthetic shadow attributes on the host element if necessary.
                    if (shadowMode === ShadowMode.Synthetic) {
                        updateSyntheticShadowAttributes(vm, html);
                    }

                    // Evaluate, create stylesheet and cache the produced VNode for future
                    // re-rendering.
                    const stylesheetsContent = getStylesheetsContent(vm, html);
                    context.styleVNode =
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

                // right before producing the vnodes, we clear up all internal references
                // to custom elements from the template.
                vm.velements = [];
                // Set the global flag that template is being updated
                isUpdatingTemplate = true;

                vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);
                const { styleVNode } = context;
                if (!isNull(styleVNode)) {
                    ArrayUnshift.call(vnodes, styleVNode);
                }
            });
        },
        () => {
            // post
            isUpdatingTemplate = isUpdatingTemplateInception;
            vmBeingRendered = vmOfTemplateBeingUpdatedInception;
            if (profilerEnabled) {
                logOperationEnd(OperationId.render, vm);
            }
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
