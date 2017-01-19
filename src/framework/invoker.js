import {
    currentContext,
    establishContext,
} from "./context.js";
import * as api from "./api.js"; 
import assert from "./assert.js";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;
export let vmBeingCreated: VM|null = null;

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
    const { Ctor, cache: { context } } = vm;
    const ctx = currentContext;
    establishContext(context);
    vmBeingCreated = vm;
    const component = new Ctor();
    vmBeingCreated = null;
    establishContext(ctx);
    return component;
}

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { cache: { component, context } } = vm;
    if (component.disconnectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.disconnectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { cache: { component, context } } = vm;
    if (component.connectedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.connectedCallback();
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): VNode {
    const { cache: { component, context } } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(context);
        isRendering = true;
        vmBeingRendered = vm;
        let elementOrVnodeOrFactory = component.render();
        // when the render method `return html;`, the factory has to be invoked
        // TODO: add identity to the html functions
        if (typeof elementOrVnodeOrFactory === 'function') {
            // TODO: for raptor elements, the tagName on the html should be preserved
            elementOrVnodeOrFactory = elementOrVnodeOrFactory.call(undefined, api, component);
        }
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        const vnode = elementOrVnodeOrFactory instanceof HTMLElement ? wrapHTMLElement(elementOrVnodeOrFactory) : elementOrVnodeOrFactory;
        return vnode || createMarker();
    }
    return createMarker();
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { cache: { component, context } } = vm;
    if (component.attributeChangedCallback) {
        const ctx = currentContext;
        establishContext(context);
        component.attributeChangedCallback(attrName, oldValue, newValue);
        establishContext(ctx);
    }
}
