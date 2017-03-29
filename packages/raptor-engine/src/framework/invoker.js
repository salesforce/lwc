import assert from "./assert.js";
import {
    currentContext,
    establishContext,
} from "./context.js";
import { evaluateTemplate } from "./template.js";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

export function invokeComponentMethod(vm: VM, methodName: string, args: Array<any>): any {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const result = component[methodName].apply(component, args);
    establishContext(ctx);
    return result;
}

export function invokeComponentConstructor(vm: VM, Ctor: Class<Component>): Component {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const component = new Ctor();
    establishContext(ctx);
    return component;
}

export function invokeComponentDisconnectedCallback(vm: VM) {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    component.disconnectedCallback();
    establishContext(ctx);
}

export function invokeComponentConnectedCallback(vm: VM) {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    component.connectedCallback();
    establishContext(ctx);
}

export function invokeComponentRenderedCallback(vm: VM) {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    component.renderedCallback();
    establishContext(ctx);
}

export function invokeComponentRenderMethod(vm: VM): Array<VNode> {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    const html = component.render();
    const result = evaluateTemplate(html, vm);
    isRendering = isRenderingInception;
    vmBeingRendered = vmBeingRenderedInception;
    establishContext(ctx);
    return result;
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component, context } = vm;
    assert.isTrue(component.attributeChangedCallback, `invokeComponentAttributeChangedCallback() should not be called if \`component.attributeChangedCallback()\` is not defined.`)
    const ctx = currentContext;
    establishContext(context);
    component.attributeChangedCallback(attrName, oldValue, newValue);
    establishContext(ctx);
}
