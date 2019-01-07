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
import { isFunction, isUndefined } from "../shared/language";
import { getErrorComponentStack, VM, UninitializedVM, runWithBoundaryProtection } from "./vm";
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
    const { component, callHook } = vm;
    const { context } = vm;
    const ctx = currentContext;
    let result;
    runWithBoundaryProtection(vm, vm.owner, () => {
        // pre
        establishContext(context);
    }, () => {
        // job
        result = callHook(component, fn, args);
    }, () => {
        // post
        establishContext(ctx);
    });
    return result;
}

export function invokeComponentConstructor(vm: UninitializedVM, Ctor: ComponentConstructor) {
    const vmBeingConstructedInception = vmBeingConstructed;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    const { context } = vm;
    const ctx = currentContext;
    establishContext(context);
    let error;
    if (process.env.NODE_ENV !== 'production') {
        startMeasure('constructor', vm);
    }
    vmBeingConstructed = vm;
    /**
     * Constructor don't need to be wrapped with a boundary because for root elements
     * it should throw, while elements from template are already wrapped by a boundary
     * associated to the diffing algo.
     */
    try {
        // job
        new Ctor();
    } catch (e) {
        error = Object(e);
    } finally {
        establishContext(ctx);
        if (process.env.NODE_ENV !== 'production') {
            endMeasure('constructor', vm);
        }
        vmBeingConstructed = vmBeingConstructedInception;
        if (!isUndefined(error)) {
            error.wcStack = getErrorComponentStack(vm.elm);
            // re-throwing the original error annotated after restoring the context
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }
}

export function invokeComponentRenderMethod(vm: VM): VNodes {
    const { def: { render }, callHook } = vm;
    const { component } = vm;
    const { context } = vm;
    const ctx = currentContext;
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result;
    runWithBoundaryProtection(vm, vm.owner, () => {
        // pre
        establishContext(context);
        if (process.env.NODE_ENV !== 'production') {
            startMeasure('render', vm);
        }
        isRendering = true;
        vmBeingRendered = vm;
    }, () => {
        // job
        const html = callHook(component, render);
        result = evaluateTemplate(vm, html);
    }, () => {
        establishContext(ctx);
        // post
        if (process.env.NODE_ENV !== 'production') {
            endMeasure('render', vm);
        }
        isRendering = isRenderingInception;
        vmBeingRendered = vmBeingRenderedInception;
    });
    return result || [];
}

export function invokeEventListener(vm: VM, fn: EventListener, thisValue: undefined | ComponentInterface, event: Event) {
    const { callHook } = vm;
    const { context } = vm;
    const ctx = currentContext;
    runWithBoundaryProtection(vm, vm.owner, () => {
        // pre
        establishContext(context);
    }, () => {
        // job
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(isFunction(fn), `Invalid event handler for event '${event.type}' on ${vm}.`);
        }
        callHook(thisValue, fn, [event]);
    }, () => {
        // post
        establishContext(ctx);
    });
}
