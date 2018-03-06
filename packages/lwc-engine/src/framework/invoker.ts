import assert from "./assert";
import {
    currentContext,
    establishContext,
} from "./context";
import { evaluateTemplate } from "./template";
import { isUndefined, isFunction } from "./language";
import { getComponentStack, VM } from "./vm";
import { ComponentConstructor, Component } from "./component";
import { VNodes } from "../3rdparty/snabbdom/types";
import { startMeasure, endMeasure } from "./performance-timing";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

export function invokeComponentCallback(vm: VM, fn: (...args: any[]) => any, args?: any[]): any {
    const { context, component } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result;
    let error;
    try {
        // TODO: membrane proxy for all args that are objects
        result = fn.apply(component, args);
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result;
}

export function invokeComponentConstructor(vm: VM, Ctor: ComponentConstructor): Component {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);

    if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'constructor');
    }

    let component;
    let error;
    try {
        component = new Ctor();
    } catch (e) {
        error = Object(e);
    } finally {
        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'constructor');
        }

        establishContext(ctx);
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return component as Component;
}

export function invokeComponentRenderMethod(vm: VM): VNodes {
    const { render } = vm;
    if (isUndefined(render)) { return []; }
    const { component, context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result;
    let error;

    if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'render');
    }

    try {
        const html = render.call(component);
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

        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'render');
        }

        establishContext(ctx);
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
        if (error) {
            error.wcStack = getComponentStack(vm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result || [];
}
