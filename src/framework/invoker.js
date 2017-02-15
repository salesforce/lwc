import {
    currentContext,
    establishContext,
} from "./context.js";
import * as api from "./api.js";
import assert from "./assert.js";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

function wrapHTMLElement(element: HTMLElement): VNode {
    assert.isTrue(element instanceof HTMLElement, "Only HTMLElements can be wrapped by h()");
    const tagName = element.tagName.toLowerCase();
    const vnode = api.h(tagName, {});
    vnode.elm = element;
    return vnode;
}

function normalizeRenderResult(vm: VM, elementOrVnodeOrArrayOfVnodes: any): Array<VNode> {
    if (!elementOrVnodeOrArrayOfVnodes) {
        return [];
    }
    // never mutate the original array
    const vnodes = Array.isArray(elementOrVnodeOrArrayOfVnodes) ? elementOrVnodeOrArrayOfVnodes.slice(0) : [elementOrVnodeOrArrayOfVnodes];
    for (let i = 0; i < vnodes.length; i += 1) {
        const elm = vnodes[i];
        if (elm instanceof HTMLElement) {
            vnodes[i] = wrapHTMLElement(elm);
        }
        assert.isTrue(vnodes[i] && vnodes[i].sel, `Invalid element ${vnodes[i]} returned in ${i + 1} position when calling ${vm}.render().`);
    }
    return vnodes;
}

export function invokeComponentConstructor(vm: VM, Ctor: ObjectConstructor): Component {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const component = new Ctor();
    establishContext(ctx);
    return component;
}

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { component, context } = vm;
    if (component.disconnectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { component, context } = vm;
    if (component.connectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): Array<VNode> {
    const { component, context } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(context);
        const isRenderingInception = isRendering;
        const vmBeingRenderedInception = vmBeingRendered;
        isRendering = true;
        vmBeingRendered = vm;
        let result = component.render();
        // when the render method `return html;`, the factory has to be invoked
        // TODO: add identity to the html functions
        if (typeof result === 'function') {
            result = result.call(undefined, api, component);
        }
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        establishContext(ctx);
        // the render method can return many different things, here we attempt to normalize it.
        return normalizeRenderResult(vm, result);
    }
    return [];
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component, context } = vm;
    if (component.attributeChangedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}
