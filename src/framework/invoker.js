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

function createMarker(): VNode {
    return { text: '' };
}

export function invokeComponentConstructor(vm: VM): Component {
    const { Ctor, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const component = new Ctor();
    establishContext(ctx);
    return component;
}

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { component, context } = vm;
    assert.isTrue(vm.flags.hasElement, '${vm} is not a custom element. Only custom elements can call disconnectedCallback()');
    if (component.disconnectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { component, context } = vm;
    assert.isTrue(vm.flags.hasElement, `${vm} is not a custom element. Only custom elements can call connectedCallback().`);
    if (component.connectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): VNode {
    const { component, context } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(context);
        isRendering = true;
        vmBeingRendered = vm;
        let elementOrVnode = component.render(api);
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        const vnode = elementOrVnode instanceof HTMLElement ? wrapHTMLElement(elementOrVnode) : elementOrVnode;
        return vnode || createMarker();
    }
    return createMarker();
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component } = vm;
    assert.isTrue(vm.flags.hasElement, `${vm} is not a custom element. Only custom elements can call attributeChangedCallback().`);
    if (component.attributeChangedCallback) {
        const ctx = currentContext;
        establishContext(this);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}
