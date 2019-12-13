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
    forEach,
    isArray,
    isFunction,
    isNull,
    isObject,
    isUndefined,
    toString,
} from '@lwc/shared';
import { logError } from '../shared/assert';
import { VNode, VNodes } from '../3rdparty/snabbdom/types';
import * as api from './api';
import { RenderAPI } from './api';
import { Context } from './context';
import { SlotSet, VM, resetShadowRoot, runWithBoundaryProtection } from './vm';
import { EmptyArray } from './utils';
import { isTemplateRegistered, registerTemplate } from './secure-template';
import {
    evaluateCSS,
    StylesheetFactory,
    applyStyleAttributes,
    resetStyleAttributes,
} from './stylesheet';
import { startMeasure, endMeasure } from './performance-timing';

export let isUpdatingTemplate: boolean = false;

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}

export { registerTemplate };
export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, ctx: Context): VNodes;

    /**
     * The stylesheet associated with the template.
     */
    stylesheets?: StylesheetFactory[];

    /**
     * List of property names that are accessed of the component instance
     * from the template.
     */
    ids?: string[];

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
const EmptySlots: SlotSet = create(null);

function validateSlots(vm: VM, html: any) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { cmpSlots = EmptySlots } = vm;
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

function validateFields(vm: VM, html: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { component } = vm;

    // validating identifiers used by template that should be provided by the component
    const { ids = [] } = html;
    forEach.call(ids, (propName: string) => {
        if (!(propName in component)) {
            // eslint-disable-next-line lwc-internal/no-production-assert
            logError(
                `The template rendered by ${vm} references \`this.${propName}\`, which is not declared. Check for a typo in the template.`,
                vm
            );
        }
    });
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode | null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isFunction(html),
            `evaluateTemplate() second argument must be an imported template instead of ${toString(
                html
            )}`
        );
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
            if (process.env.NODE_ENV !== 'production') {
                startMeasure('render', vm);
            }
        },
        () => {
            // job
            const { component, context, cmpSlots, cmpTemplate, tro } = vm;
            tro.observe(() => {
                // reset the cache memoizer for template when needed
                if (html !== cmpTemplate) {
                    // perf opt: do not reset the shadow root during the first rendering (there is nothing to reset)
                    if (!isUndefined(cmpTemplate)) {
                        // It is important to reset the content to avoid reusing similar elements generated from a different
                        // template, because they could have similar IDs, and snabbdom just rely on the IDs.
                        resetShadowRoot(vm);
                    }

                    // Check that the template was built by the compiler
                    if (isUndefined(html) || !isTemplateRegistered(html)) {
                        throw new TypeError(
                            `Invalid template returned by the render() method on ${vm}. It must return an imported template (e.g.: \`import html from "./${
                                vm.def.name
                            }.html"\`), instead, it has returned: ${toString(html)}.`
                        );
                    }

                    vm.cmpTemplate = html;

                    // Populate context with template information
                    context.tplCache = create(null);

                    resetStyleAttributes(vm);

                    const { stylesheets, stylesheetTokens } = html;
                    if (isUndefined(stylesheets) || stylesheets.length === 0) {
                        context.styleVNode = null;
                    } else if (!isUndefined(stylesheetTokens)) {
                        const { hostAttribute, shadowAttribute } = stylesheetTokens;
                        applyStyleAttributes(vm, hostAttribute, shadowAttribute);
                        // Caching style vnode so it can be reused on every render
                        context.styleVNode = evaluateCSS(
                            stylesheets,
                            hostAttribute,
                            shadowAttribute
                        );
                    }

                    if (process.env.NODE_ENV !== 'production') {
                        // one time operation for any new template returned by render()
                        // so we can warn if the template is attempting to use a binding
                        // that is not provided by the component instance.
                        validateFields(vm, html);
                    }
                }

                if (process.env.NODE_ENV !== 'production') {
                    assert.isTrue(
                        isObject(context.tplCache),
                        `vm.context.tplCache must be an object associated to ${cmpTemplate}.`
                    );
                    // validating slots in every rendering since the allocated content might change over time
                    validateSlots(vm, html);
                }
                // right before producing the vnodes, we clear up all internal references
                // to custom elements from the template.
                vm.velements = [];
                // Set the global flag that template is being updated
                isUpdatingTemplate = true;

                vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache!);
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
            if (process.env.NODE_ENV !== 'production') {
                endMeasure('render', vm);
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
