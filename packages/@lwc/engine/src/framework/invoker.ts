/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { currentContext, establishContext } from './context';

import { evaluateTemplate } from './template';
import { isFunction, isUndefined } from '../shared/language';
import { getErrorComponentStack, VM, UninitializedVM, runWithBoundaryProtection } from './vm';
import { ComponentConstructor, ComponentInterface } from './component';
import { VNodes } from '../3rdparty/snabbdom/types';
import { startMeasure, endMeasure } from './performance-timing';

export let isRendering: boolean = false;
export let vmBeingRendered: VM | null = null;

export let vmBeingConstructed: UninitializedVM | null = null;
export function isBeingConstructed(vm: VM): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpProps' in vm, `${vm} is not a vm.`);
    }
    return vmBeingConstructed === vm;
}

export function invokeComponentCallback(vm: VM, fn: (...args: any[]) => any, args?: any[]): any {
    const { component, callHook, context, owner } = vm;
    const ctx = currentContext;
    let result;
    runWithBoundaryProtection(
        vm,
        owner,
        () => {
            // pre
            establishContext(context);
        },
        () => {
            // job
            result = callHook(component, fn, args);
        },
        () => {
            // post
            establishContext(ctx);
        }
    );
    return result;
}

export function invokeComponentConstructor(vm: UninitializedVM, Ctor: ComponentConstructor) {
    const vmBeingConstructedInception = vmBeingConstructed;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpProps' in vm, `${vm} is not a vm.`);
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
     * Constructors don't need to be wrapped with a boundary because for root elements
     * it should throw, while elements from template are already wrapped by a boundary
     * associated to the diffing algo.
     */
    try {
        // job
        const result = new Ctor();

        // Check indirectly if the constructor result is an instance of LightningElement. Using
        // the "instanceof" operator would not work here since Locker Service provides its own
        // implementation of LightningElement, so we indirectly check if the base constructor is
        // invoked by accessing the component on the vm.
        if (vmBeingConstructed.component !== result) {
            throw new TypeError(
                'Invalid component constructor, the class should extend LightningElement.'
            );
        }
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
    const {
        def: { render },
        callHook,
        component,
        context,
        owner,
    } = vm;
    const ctx = currentContext;
    const isRenderingInception = isRendering;
    const vmBeingRenderedInception = vmBeingRendered;
    isRendering = true;
    vmBeingRendered = vm;
    let result;
    runWithBoundaryProtection(
        vm,
        owner,
        () => {
            // pre
            establishContext(context);
            if (process.env.NODE_ENV !== 'production') {
                startMeasure('render', vm);
            }
            isRendering = true;
            vmBeingRendered = vm;
        },
        () => {
            // job
            vm.tro.observe(() => {
                const html = callHook(component, render);
                result = evaluateTemplate(vm, html);
            });
        },
        () => {
            establishContext(ctx);
            // post
            if (process.env.NODE_ENV !== 'production') {
                endMeasure('render', vm);
            }
            isRendering = isRenderingInception;
            vmBeingRendered = vmBeingRenderedInception;
        }
    );
    return result || [];
}

export function invokeEventListener(
    vm: VM,
    fn: EventListener,
    thisValue: undefined | ComponentInterface,
    event: Event
) {
    const { callHook, owner, context } = vm;
    const ctx = currentContext;
    runWithBoundaryProtection(
        vm,
        owner,
        () => {
            // pre
            establishContext(context);
        },
        () => {
            // job
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(
                    isFunction(fn),
                    `Invalid event handler for event '${event.type}' on ${vm}.`
                );
            }
            callHook(thisValue, fn, [event]);
        },
        () => {
            // post
            establishContext(ctx);
        }
    );
}
