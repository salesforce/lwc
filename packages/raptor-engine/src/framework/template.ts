import assert from "./assert";
import * as api from "./api";
import { isArray, isFunction, isObject, isUndefined, create, ArrayIndexOf, toString, hasOwnProperty } from "./language";

const EmptySlots: Slotset = create(null);

function getSlotsetValue(slotset: Slotset, slotName: string): Array<VNode> {
    assert.isTrue(isObject(slotset), `Invalid slotset value ${toString(slotset)}`);
    // TODO: mark slotName as reactive
    return slotset && slotset[slotName];
}

const slotsetProxyHandler: ProxyHandler<Slotset> = {
    get: (slotset: Slotset, key: string): any => getSlotsetValue(slotset, key),
    set: (): boolean => {
        assert.logError(`$slotset object cannot be mutated from template.`);
        return false;
    },
    deleteProperty: (): boolean => {
        assert.logError(`$slotset object cannot be mutated from template.`);
        return false;
    },
    apply(/*target: any, thisArg: any, argArray?: any*/) {
        assert.fail(`invalid call invocation from slotset`);
    },
    construct(/*target: any, argArray: any, newTarget?: any*/) {
        assert.fail(`invalid construction invocation from slotset`);
    },
};

function validateSlots(vm: VM, html: any) {
    let { cmpSlots = EmptySlots } = vm;
    const { slots = [] } = html;
    for (let slotName in cmpSlots) {
        if (ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: this should never really happen because the compiler should always validate
            console.warn(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`);
        }
    }
}

function validateFields(vm: VM, html: any) {
    let { component } = vm;
    // validating identifiers used by template that should be provided by the component
    const { ids = [] } = html;
    ids.forEach((propName: string) => {
        if (!(propName in component)) {
            console.warn(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`);
        } else if (hasOwnProperty.call(component, propName)) {
            assert.fail(`${component}'s template is accessing \`this.${toString(propName)}\` directly, which is considered a private field. Instead access it via a getter or make it reactive by moving it to \`this.state.${toString(propName)}\`.`);
        }
    });
}

function validateTemplate(vm: VM, html: any) {
    validateSlots(vm, html);
    validateFields(vm, html);
}

function applyTokenToHost(vm: VM, html: Template): void {
    const { vnode, context } = vm;

    const oldToken = context.tplToken;
    const newToken = html.token;

    if (oldToken !== newToken) {
        const host = vnode.elm as Element;

        // Remove the token currently applied to the host element if different than the one associated
        // with the current template
        if (!isUndefined(oldToken)) {
            host.removeAttribute(oldToken);
        }

        // If the template has a token apply the token to the host element
        if (!isUndefined(newToken)) {
            host.setAttribute(newToken, '');
        }
    }
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode|null> {
    assert.vm(vm);
    assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);

    // TODO: add identity to the html functions
    let { component, context, cmpSlots = EmptySlots, cmpTemplate } = vm;
    // reset the cache momizer for template when needed
    if (html !== cmpTemplate) {
        applyTokenToHost(vm, html);

        vm.cmpTemplate = html;

        context.tplCache = create(null);
        context.tplToken = html.token;

        assert.block(function devModeCheck() {
            validateTemplate(vm, html);
        });
    }
    assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
    const { proxy: slotset, revoke: slotsetRevoke } = Proxy.revocable(cmpSlots, slotsetProxyHandler);
    let vnodes = html.call(undefined, api, component, slotset, context.tplCache);
    assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    slotsetRevoke();
    return vnodes;
}
