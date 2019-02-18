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
    hasOwnProperty,
    forEach,
    ArrayUnshift,
} from '../shared/language';
import { VNode, VNodes } from '../3rdparty/snabbdom/types';
import * as api from './api';
import { RenderAPI } from './api';
import { Context } from './context';
import { SlotSet, VM, resetShadowRoot } from './vm';
import { EmptyArray } from './utils';
import { ComponentInterface } from './component';
import { isTemplateRegistered, registerTemplate } from './secure-template';
import { evaluateCSS, StylesheetFactory, applyStyleAttributes, resetStyleAttributes } from './stylesheet';

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
         * This attribute is used for style encapsulation when the engine runs in fallback mode.
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
        // eslint-disable-next-line no-production-assert
        assert.isTrue(
            isArray(cmpSlots[slotName]),
            `Slots can only be set to an array, instead received ${toString(
                cmpSlots[slotName],
            )} for slot "${slotName}" in ${vm}.`,
        );

        if (ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: this should never really happen because the compiler should always validate
            // eslint-disable-next-line no-production-assert
            assert.logWarning(
                `Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`,
                vm.elm,
            );
        }
    }
}

function validateFields(vm: VM, html: Template) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const component = vm.component as ComponentInterface;
    // validating identifiers used by template that should be provided by the component
    const { ids = [] } = html;
    forEach.call(ids, (propName: string) => {
        if (!(propName in component)) {
            // eslint-disable-next-line no-production-assert
            assert.logWarning(
                `The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`,
                vm.elm,
            );
        } else if (hasOwnProperty.call(component, propName)) {
            // eslint-disable-next-line no-production-assert
            assert.fail(
                `${component}'s template is accessing \`this.${toString(
                    propName,
                )}\`, which is considered a non-reactive private field. Instead access it via a getter or make it reactive by decorating it with \`@track ${toString(
                    propName,
                )}\`.`,
            );
        }
    });
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode | null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(
            isFunction(html),
            `evaluateTemplate() second argument must be an imported template instead of ${toString(html)}`,
        );
    }

    // TODO: add identity to the html functions
    const { component, context, cmpSlots, cmpTemplate } = vm;
    // reset the cache memoizer for template when needed
    if (html !== cmpTemplate) {
        // It is important to reset the content to avoid reusing similar elements generated from a different
        // template, because they could have similar IDs, and snabbdom just rely on the IDs.
        resetShadowRoot(vm);

        // Check that the template was built by the compiler
        if (!isTemplateRegistered(html)) {
            throw new TypeError(
                `Invalid template returned by the render() method on ${vm}. It must return an imported template (e.g.: \`import html from "./${
                    vm.def.name
                }.html"\`), instead, it has returned: ${toString(html)}.`,
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
            context.styleVNode = evaluateCSS(vm, stylesheets, hostAttribute, shadowAttribute);
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
            `vm.context.tplCache must be an object associated to ${cmpTemplate}.`,
        );
        // validating slots in every rendering since the allocated content might change over time
        validateSlots(vm, html);
    }
    const vnodes: VNodes = html.call(undefined, api, component, cmpSlots, context.tplCache!);

    const { styleVNode } = context;
    if (!isNull(styleVNode)) {
        ArrayUnshift.call(vnodes, styleVNode);
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    }
    return vnodes;
}
