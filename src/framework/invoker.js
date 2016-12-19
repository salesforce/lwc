//<reference path="types.d.ts"/>

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

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { component } = vm;
    if (component.disconnectedCallback) {
        const ctx = currentContext;
        establishContext(this);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { component } = vm;
    if (component.connectedCallback) {
        const ctx = currentContext;
        establishContext(this);
        component.connectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): VNode {
    const { component } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        isRendering = true;
        vmBeingRendered = vm;
        let elementOrVnode = component.render(api);
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        const vnode = elementOrVnode instanceof HTMLElement ? wrapHTMLElement(elementOrVnode) : elementOrVnode;
        return vnode;
    }
    return null;
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component } = vm;
    if (component.attributeChangedCallback) {
        const ctx = currentContext;
        establishContext(this);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}
