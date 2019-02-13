/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from "../shared/assert";
import {
    currentContext,
    establishContext,
} from "./context";

import { evaluateTemplate } from "./template";
import { isFunction } from "../shared/language";
import { getErrorComponentStack, VM, UninitializedVM } from "./vm";
import { ComponentConstructor, ComponentInterface } from "./component";
import { VNodes } from "../3rdparty/snabbdom/types";
import { startMeasure, endMeasure } from "./performance-timing";

export let isRendering: boolean = false;
export let vmBeingRendered: VM|null = null;

export let vmBeingConstructed: UninitializedVM | null = null;
export function isBeingConstructed(vm: VM): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    return vmBeingConstructed === vm;
}

export function invokeComponentCallback(vm: VM, fn: (...args: any[]) => any, args?: any[]): any {
    const { context, component, callHook } = vm;
    const ctx = currentContext;
    establishContext(context);
    let result;
    let error;
    try {
        result = callHook(component, fn, args);
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getErrorComponentStack(vm.elm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result;
}

export function invokeComponentConstructor(vm: UninitializedVM, Ctor: ComponentConstructor) {
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;

    if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'constructor');
    }

    let error;
    try {
        new Ctor(); // tslint:disable-line
    } catch (e) {
        error = Object(e);
    } finally {
        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'constructor');
        }

        establishContext(ctx);
        vmBeingConstructed = vmBeingConstructedInception;
        if (error) {
            error.wcStack = getErrorComponentStack(vm.elm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
}

export function invokeComponentRenderMethod(vm: VM): VNodes {
    const { def: { render }, callHook } = vm;
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
        const html = callHook(component, render);
        result = evaluateTemplate(vm, html);
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
            error.wcStack = getErrorComponentStack(vm.elm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
    return result || [];
}

export function invokeEventListener(vm: VM, fn: EventListener, thisValue: undefined | ComponentInterface, event: Event) {
    const { context, callHook } = vm;
    const ctx = currentContext;
    establishContext(context);
    let error;
    try {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(isFunction(fn), `Invalid event handler for event '${event.type}' on ${vm}.`);
        }
        callHook(thisValue, fn, [event]);
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (error) {
            error.wcStack = getErrorComponentStack(vm.elm);
            // rethrowing the original error annotated after restoring the context
            throw error; // tslint:disable-line
        }
    }
}
