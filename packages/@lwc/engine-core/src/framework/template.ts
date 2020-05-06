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
    isNull,
    isUndefined,
    toString,
} from '@lwc/shared';
import { logError } from '../shared/logger';
import { VNode, VNodes } from '../3rdparty/snabbdom/types';
import * as api from './api';
import { RenderAPI } from './api';
import { SlotSet, Context, VM, resetShadowRoot, runWithBoundaryProtection } from './vm';
import { EmptyObject, EmptyArray } from './utils';
import { isTemplateRegistered } from './secure-template';
import { startMeasure, endMeasure } from './performance-timing';

export type StylesheetFactory = (
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean
) => string;

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, ctx: Context): VNodes;

    /**
     * The slots names associated with this template.
     */
    slots?: string[];

    /**
     * The stylesheet associated with the template. The stylesheets entry is an array in the case
     * of CSS only modules.
     */
    stylesheets?: Array<StylesheetFactory | StylesheetFactory[]>;

    /**
     * The stylesheet attributes configuration used for synthetic shadow.
     */
    stylesheetTokens?: {
        /**
         * HTML attribute that need to be applied to the host element. This attribute is used for the
         * `:host` pseudo class CSS selector.
         */
        hostAttribute: string;

        /**
         * HTML attribute that need to the applied to all the element that the template produces.
         * This attribute is used for style encapsulation when the engine runs with synthetic shadow.
         */
        shadowAttribute: string;
    };
}

export let isUpdatingTemplate: boolean = false;

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}
export function isVMBeingRendered(vm: VM) {
    return vm === vmBeingRendered;
}

function evaluateStylesheet(vm: VM, template: Template): string {
    const stylesheets: string[] = [];

    const { stylesheets: factories, stylesheetTokens: tokens } = template;
    const { syntheticShadow: useSyntheticShadow } = vm.renderer;

    if (!isUndefined(factories) && !isUndefined(tokens)) {
        const hostSelector = useSyntheticShadow ? `[${tokens.hostAttribute}]` : '';
        const shadowSelector = useSyntheticShadow ? `[${tokens.shadowAttribute}]` : '';

        for (let i = 0; i < factories.length; i++) {
            const factory = factories[i];

            if (isArray(factory)) {
                for (let j = 0; j < factory.length; j++) {
                    stylesheets.push(factory[j](hostSelector, shadowSelector, !useSyntheticShadow));
                }
            } else {
                stylesheets.push(factory(hostSelector, shadowSelector, !useSyntheticShadow));
            }
        }
    }

    return stylesheets.join('\n');
}

function applySyntheticShadowStyleAttributes(
    vm: VM,
    oldTemplate: Template | undefined,
    newTemplate: Template,
    stylesheet: string
): void {
    const { context, elm, renderer } = vm;
    const { stylesheetTokens: newTokens } = newTemplate;

    let hostAttribute: string | undefined;
    let shadowAttribute: string | undefined;

    // Remove previous template host attribute if present.
    if (!isUndefined(oldTemplate) && !isUndefined(oldTemplate.stylesheetTokens)) {
        renderer.removeAttribute(elm, oldTemplate.stylesheetTokens.hostAttribute);
    }

    // Only apply the shadow DOM style attributes if the stylesheet is not empty.
    if (stylesheet.length > 0) {
        if (!isUndefined(newTokens)) {
            renderer.setAttribute(elm, newTokens.hostAttribute, '');
            hostAttribute = newTokens.hostAttribute;
            shadowAttribute = newTokens.shadowAttribute;
        }

        context.hostAttribute = hostAttribute;
        context.shadowAttribute = shadowAttribute;
    }
}

function validateSlots(vm: VM, html: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    const { cmpSlots = EmptyObject } = vm;
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

export function evaluateTemplate(vm: VM, html: Template): Array<VNode | null> {
    let vnodes: VNodes = [];

    const {
        component,
        context,
        cmpSlots,
        cmpTemplate,
        tro,
        renderer: { injectStylesheet, syntheticShadow: useSyntheticShadow },
    } = vm;

    const isUpdatingTemplateInception = isUpdatingTemplate;
    const vmOfTemplateBeingUpdatedInception = vmBeingRendered;

    vmBeingRendered = vm;

    // Reset the cached information if the passed template is different than the previously rendered one.
    if (html !== cmpTemplate) {
        // Check that the template was built by the template compiler.
        if (isUndefined(html) || !isTemplateRegistered(html)) {
            throw new TypeError(
                `Invalid template returned by the render() method on ${vm}. It must return an imported template (e.g.: \`import html from "./${
                    vm.def.name
                }.html"\`), instead, it has returned: ${toString(html)}.`
            );
        }

        // If the component already rendered before, we need first to clean up the shadow root (note that this doesn't
        // happen during the first render for performance reasons). It is important to reset the content to avoid
        // reusing similar elements generated from a different template, because they could have similar IDs, and
        // snabbdom just rely on the IDs.
        if (!isUndefined(cmpTemplate)) {
            resetShadowRoot(vm);
        }

        vm.cmpTemplate = html;
        context.tplCache = create(null);

        const stylesheet = evaluateStylesheet(vm, html);

        let styleElement: HTMLStyleElement | undefined;
        if (stylesheet.length > 0) {
            styleElement = injectStylesheet(stylesheet);
        }

        if (useSyntheticShadow) {
            applySyntheticShadowStyleAttributes(vm, cmpTemplate, html, stylesheet);
        }

        if (!isUndefined(styleElement) && !isUndefined(html.stylesheetTokens)) {
            // TODO [#1364]: supporting the ability to inject a cloned StyleElement forcing the diffing algo to use the
            // cloned style for native shadow
            const styleNode = api.h(
                'style',
                {
                    key: 'style', // special key
                },
                EmptyArray
            );
            styleNode.clonedElement = styleElement;

            context.styleVNode = styleNode;
        }
    }

    // Validating slots in every rendering since the allocated content might change over time.
    if (process.env.NODE_ENV !== 'production') {
        validateSlots(vm, html);
    }

    runWithBoundaryProtection(
        vm,
        vm.owner,
        () => {
            // pre
            if (process.env.NODE_ENV !== 'production') {
                startMeasure('render', vm);
            }
        },
        () => {
            // right before producing the vnodes, we clear up all internal references
            // to custom elements from the template.
            vm.velements = [];
            // Set the global flag that template is being updated
            isUpdatingTemplate = true;

            // job
            tro.observe(() => {
                vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache!);
            });
        },
        () => {
            // post
            isUpdatingTemplate = isUpdatingTemplateInception;
            vmBeingRendered = vmOfTemplateBeingUpdatedInception;
            if (process.env.NODE_ENV !== 'production') {
                endMeasure('render', vm);
            }
        }
    );

    const { styleVNode } = context;
    if (!isNull(styleVNode)) {
        ArrayUnshift.call(vnodes, styleVNode);
    }

    return vnodes;
}
