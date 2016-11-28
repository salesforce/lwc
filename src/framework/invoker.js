// @flow

///<reference path="types.d.ts"/>

import {
    currentContext,
    establishContext,
} from "./context.js";

import { ObjectElementToVMMap } from "./createElement.js"; 

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

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
    const { component, api } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        isRendering = true;
        vmBeingRendered = vm;
        const vnode = component.render(api);
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        // TODO: find a way to not having to search inside the weakmap for every render
        //       invocation, and only doing so if we know it is raptor element.
        if (vnode && ObjectElementToVMMap.has(vnode)) {
            return ObjectElementToVMMap.get(vnode);
        }
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
