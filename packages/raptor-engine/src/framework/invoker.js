import assert from "./assert.js";
import {
    currentContext,
    establishContext,
} from "./context.js";
import { evaluateTemplate } from "./template.js";
import { create, isFunction } from "./language.js";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

export function invokeComponentCallback(vm: VM, fn: () => any, fnCtx: any, args?: Array<any>): any {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result, error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(fnCtx, args);
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result;
}

export function invokeComponentMethod(vm: VM, methodName: string, args?: Array<any>): any {
    const { component } = vm;
    return invokeComponentCallback(vm, component[methodName], component, args);
}

export function invokeComponentConstructor(vm: VM, Ctor: Class<Component>): Component {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let component, error;
    try {
        component = new Ctor();
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return component;
}

export function invokeComponentRenderMethod(vm: VM): Array<VNode> {
    const { component, context, cmpTemplate } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result, error;
    try {
        const html = component.render();
        if (html !== cmpTemplate && isFunction(html)) {
            context.tplCache = create(null); // reset the momizer for template
            vm.cmpTemplate = html;
        }
        result = evaluateTemplate(html, vm);
    } catch (e) {
        error = e;
    }
    isRendering = isRenderingInception;
    vmBeingRendered = vmBeingRenderedInception;
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
    return result || [];
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    const { component, context } = vm;
    assert.isTrue(component.attributeChangedCallback, `invokeComponentAttributeChangedCallback() should not be called if \`component.attributeChangedCallback()\` is not defined.`)
    const ctx = currentContext;
    establishContext(context);
    let error;
    try {
        component.attributeChangedCallback(attrName, oldValue, newValue);
    } catch (e) {
        error = e;
    }
    establishContext(ctx);
    if (error) {
        throw error; // rethrowing the original error after restoring the context
    }
}
