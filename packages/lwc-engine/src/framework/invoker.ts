import assert from "./assert";
import {
    currentContext,
    establishContext,
} from "./context";
import { evaluateTemplate } from "./template";
import { isUndefined, isFunction } from "./language";
import { getComponentStack } from "./vm";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

export function invokeComponentCallback(vm: VM, fn: (...args: any[]) => any, fnCtx: any, args?: Array<any>): any {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result, error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(fnCtx, args);
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }
    return result;
}

export function invokeComponentMethod(vm: VM, methodName: string, args?: Array<any>): any {
    const { component } = vm;
    return invokeComponentCallback(vm, component[methodName], component, args);
}

export function invokeComponentConstructor(vm: VM, Ctor: ComponentContructor): Component | undefined {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let component, error;
    try {
        component = new Ctor();
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }
    return component;
}


export function invokeComponentRenderMethod(vm: VM): Array<VNode> {
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result, error;
    try {
        const html = component.render();
        if (isFunction(html)) {
            result = evaluateTemplate(vm, html);
        } else if (!isUndefined(html)) {
            if (process.env.NODE_ENV !== 'production') {
                assert.fail(`The template rendered by ${vm} must return an imported template tag (e.g.: \`import html from "./mytemplate.html"\`) or undefined, instead, it has returned ${html}.`);
            }
        }
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }
    return result || [];
}

export function invokeComponentAttributeChangedCallback(vm: VM, attrName: string, oldValue: any, newValue: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(vm.component.attributeChangedCallback, `if ${vm} does not have attributeChangedCallback it should never call invokeComponentAttributeChangedCallback()`);
    }
    invokeComponentCallback(vm, vm.component.attributeChangedCallback, vm.component, [attrName, oldValue, newValue]);
}

