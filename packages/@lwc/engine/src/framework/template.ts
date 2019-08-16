/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import {
    isArray,
    isFunction,
    isNull,
    isObject,
    isUndefined,
    create,
    ArrayIndexOf,
    toString,
    forEach,
} from '../shared/language';
import { VNode, VNodes } from '../3rdparty/snabbdom/types';
import * as api from './api';
import { RenderAPI } from './api';
import { Context } from './context';
import { SlotSet, VM } from './vm';
import { EmptyArray } from './utils';
import { isTemplateRegistered, registerTemplate } from './secure-template';
import { StylesheetFactory, applyStyle, resetStyle, StylesheetTokens } from './stylesheet';

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

    stylesheetTokens?: StylesheetTokens;
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
        // eslint-disable-next-line no-production-assert
        assert.isTrue(
            isArray(cmpSlots[slotName]),
            `Slots can only be set to an array, instead received ${toString(
                cmpSlots[slotName]
            )} for slot "${slotName}" in ${vm}.`
        );

        if (slotName !== '' && ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: #1297 - this should never really happen because the compiler should always validate
            // eslint-disable-next-line no-production-assert
            assert.logError(
                `Ignoring unknown provided slot name "${slotName}" in ${vm}. Check for a typo on the slot attribute.`,
                vm.elm
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
            // eslint-disable-next-line no-production-assert
            assert.logError(
                `The template rendered by ${vm} references \`this.${propName}\`, which is not declared. Check for a typo in the template.`,
                vm.elm
            );
        }
    });
}

// This is a super optimized mechanism to remove the content of the shadowRoot
// without having to go into snabbdom. This assumes that nodes are present and
// connected, otherwise it throws, and will be captured by outer control, the
// main goal is to do this clean up as fast as possible.
function resetTemplate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    // removing all tracked childNodes
    const { children, cmpRoot } = vm;
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (!isNull(vnode)) {
            const { elm } = vnode;
            // the vnode must have elm defined, and must be connected
            cmpRoot.removeChild(elm as Node);
        }
    }
    vm.children = EmptyArray;
    // intentionally leaving out any manually inserted node in the shadowRoot
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode | null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(
            isFunction(html),
            `evaluateTemplate() second argument must be an imported template instead of ${toString(
                html
            )}`
        );
    }

    const { component, context, cmpSlots, cmpTemplate } = vm;
    // reset the cache memoizer for template when needed
    if (html !== cmpTemplate) {
        // perf opt: do not reset the shadow root during the first rendering (there is nothing to reset)
        if (!isUndefined(cmpTemplate)) {
            // It is important to reset the content to avoid reusing similar elements generated from a different
            // template, because they could have similar IDs, and snabbdom just rely on the IDs.
            resetTemplate(vm);
            resetStyle(vm);
        }

        // Check that the template was built by the compiler
        if (!isTemplateRegistered(html)) {
            throw new TypeError(
                `Invalid template returned by the render() method on ${vm}. It must return an imported template (e.g.: \`import html from "./${
                    vm.def.name
                }.html"\`), instead, it has returned: ${toString(html)}.`
            );
        }

        vm.cmpTemplate = html;

        // Populate context with template information
        context.tplCache = create(null);

        const { stylesheets, stylesheetTokens } = html;
        if (!isUndefined(stylesheetTokens) && !isUndefined(stylesheets) && stylesheets.length > 0) {
            applyStyle(vm, stylesheets, stylesheetTokens);
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
    // invoke the selected template.
    const vnodes: VNodes = html.call(undefined, api, component, cmpSlots, context.tplCache!);

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isArray(vnodes),
            `Compiler should produce html functions that always return an array.`
        );
    }
    return vnodes;
}
