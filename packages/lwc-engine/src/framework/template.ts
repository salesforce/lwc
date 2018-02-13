import assert from "./assert";
import * as api from "./api";
import { isArray, isFunction, isObject, isUndefined, create, ArrayIndexOf, toString, hasOwnProperty, assign } from "./language";
import { prepareForAttributeMutationFromTemplate } from './def';

import { VNode, VNodes } from "../3rdparty/snabbdom/types";
import { RenderAPI } from "./api";
import { Context } from "./context";
import { Slotset, VM, resetShadowRoot } from "./vm";
import { EmptyArray } from "./utils";
import { Component } from "./component";

export interface Template {
    (api: RenderAPI, cmp: object, slotset: Slotset, ctx: Context): undefined | VNodes;
    style?: string;
    token?: string;
}

const EmptySlots: Slotset = create(null);

function getSlotsetValue(slotset: Slotset, slotName: string): VNode[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(slotset), `Invalid slotset value ${toString(slotset)}`);
    }
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}

const slotsetProxyHandler: ProxyHandler<Slotset> = {
    get: (slotset: Slotset, key: string): any => getSlotsetValue(slotset, key),
    set: (): boolean => {
        if (process.env.NODE_ENV !== 'production') {
            assert.logError(`$slotset object cannot be mutated from template.`);
        }
        return false;
    },
    deleteProperty: (): boolean => {
        if (process.env.NODE_ENV !== 'production') {
            assert.logError(`$slotset object cannot be mutated from template.`);
        }
        return false;
    },
};

if (process.env.NODE_ENV === 'production') {
    assign(slotsetProxyHandler, {
        apply(target: any, thisArg: any, argArray?: any) {
            throw new Error(`invalid call invocation from slotset`);
        },
        construct(target: Slotset, argArray: any, newTarget?: any): object {
            throw new Error(`invalid construction invocation from slotset`);
        },
    });
}

function validateSlots(vm: VM, html: any) {
    if (process.env.NODE_ENV !== 'production') {
        const { cmpSlots = EmptySlots } = vm;
        const { slots = EmptyArray } = html;
        for (const slotName in cmpSlots) {
            assert.isTrue(isArray(cmpSlots[slotName]) && cmpSlots[slotName].length > 0, `Slots can only be set to a non-empty array, instead received ${toString(cmpSlots[slotName])} for slot ${slotName} in ${vm}.`);
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
        ids.forEach((propName: string) => {
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

function applyTokenToHost(vm: VM, html: Template): void {
    const { context } = vm;

    const oldToken = context.tplToken;
    const newToken = html.token;

    if (oldToken !== newToken) {
        const host = vm.elm;

        // Remove the token currently applied to the host element if different than the one associated
        // with the current template
        if (!isUndefined(oldToken)) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForAttributeMutationFromTemplate(host, oldToken);
            }
            host.removeAttribute(oldToken);
        }

        // If the template has a token apply the token to the host element
        if (!isUndefined(newToken)) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForAttributeMutationFromTemplate(host, newToken);
            }
            host.setAttribute(newToken, '');
        }
    }
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode|null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    }

    // TODO: add identity to the html functions
    const { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        if (!isUndefined(cmpTemplate)) {
            resetShadowRoot(vm);
        }
        applyTokenToHost(vm, html);

        vm.cmpTemplate = html;

        context.tplCache = create(null);
        context.tplToken = html.token;

        if (process.env.NODE_ENV !== 'production') {
            validateTemplate(vm, html);
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    }
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    const vnodes = html.call(undefined, api, component, slotset, context.tplCache);

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    }
    slotsetRevoke();
    return vnodes;
}
