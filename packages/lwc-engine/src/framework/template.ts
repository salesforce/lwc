import assert from "./assert";
import * as api from "./api";
import { isArray, isFunction, isObject, isUndefined, create, ArrayIndexOf, toString, hasOwnProperty, forEach } from "./language";
import { VNode, VNodes } from "../3rdparty/snabbdom/types";
import { RenderAPI } from "./api";
import { Context } from "./context";
import { SlotSet, VM, resetShadowRoot } from "./vm";
import { EmptyArray } from "./utils";
import { Component } from "./component";
import { removeAttribute, setAttribute } from "./dom/element";

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, ctx: Context): undefined | VNodes;

    /**
     * HTML attribute that need to be applied to the host element.
     * This attribute is used for the `:host` pseudo class CSS selector.
     */
    hostToken?: string;

    /**
     * HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs in fallback mode.
     */
    shadowToken?: string;
}

const EmptySlots: SlotSet = create(null);

function validateSlots(vm: VM, html: any) {
    if (process.env.NODE_ENV !== 'production') {
        const { cmpSlots = EmptySlots } = vm;
        const { slots = EmptyArray } = html;
        for (const slotName in cmpSlots) {
            assert.isTrue(isArray(cmpSlots[slotName]), `Slots can only be set to an array, instead received ${toString(cmpSlots[slotName])} for slot ${slotName} in ${vm}.`);
            if (ArrayIndexOf.call(slots, slotName) === -1) {
                // TODO: this should never really happen because the compiler should always validate
                assert.logWarning(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
            }
        }
    }
}

function validateFields(vm: VM, html: any) {
    if (process.env.NODE_ENV !== 'production') {
        const component = vm.component as Component;
        // validating identifiers used by template that should be provided by the component
        const { ids = [] } = html;
        forEach.call(ids, (propName: string) => {
            if (!(propName in component)) {
                assert.logWarning(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
            } else if (hasOwnProperty.call(component, propName)) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.fail(`${component}'s template is accessing \`this.${toString(propName)}\` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString(propName)}\`.`);
                }
            }
        });
    }
}

function validateTemplate(vm: VM, html: any) {
    validateSlots(vm, html);
    validateFields(vm, html);
}

/**
 * Apply/Update the styling token applied to the host element.
 */
function applyTokenToHost(vm: VM, html: Template): void {
    const { context, elm } = vm;

    const oldToken = context.hostToken;
    const newToken = html.hostToken;

    // Remove the token currently applied to the host element if different than the one associated
    // with the current template
    if (!isUndefined(oldToken)) {
        removeAttribute.call(elm, oldToken);
    }
    // If the template has a token apply the token to the host element
    if (!isUndefined(newToken)) {
        setAttribute.call(elm, newToken, '');
    }
    context.hostToken = html.hostToken;
    context.shadowToken = html.shadowToken;
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode|null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    }

    // TODO: add identity to the html functions
    const { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache memoizer for template when needed
    if (html !== cmpTemplate) {
        if (!isUndefined(cmpTemplate)) {
            resetShadowRoot(vm);
        }
        vm.cmpTemplate = html;

        // Populate context with template information
        context.tplCache = create(null);

        // TODO: tokens are only needed in fallback mode
        applyTokenToHost(vm, html);

        if (process.env.NODE_ENV !== 'production') {
            validateTemplate(vm, html);
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    }
    const vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    }
    return vnodes;
}
