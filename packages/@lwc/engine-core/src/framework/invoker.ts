/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFunction, isUndefined, noop } from '@lwc/shared';

import { addErrorComponentStack } from '../shared/error';

import { evaluateTemplate, setVMBeingRendered, getVMBeingRendered } from './template';
import { runWithBoundaryProtection } from './vm';
import { logOperationStart, logOperationEnd, OperationId } from './profiler';
import { LightningElement } from './base-lightning-element';
import type { Template } from './template';
import type { VM } from './vm';
import type { LightningElementConstructor } from './base-lightning-element';
import type { VNodes } from './vnodes';

export let isInvokingRender: boolean = false;

export let vmBeingConstructed: VM | null = null;
export function isBeingConstructed(vm: VM): boolean {
    return vmBeingConstructed === vm;
}

export function invokeComponentCallback(vm: VM, fn: (...args: any[]) => any, args?: any[]): void {
    const { component, callHook, owner } = vm;

    runWithBoundaryProtection(
        vm,
        owner,
        noop,
        () => {
            callHook(component, fn, args);
        },
        noop
    );
}

export function invokeComponentConstructor(vm: VM, Ctor: LightningElementConstructor) {
    const vmBeingConstructedInception = vmBeingConstructed;
    let error;

    logOperationStart(OperationId.Constructor, vm);

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
        // TODO [W-17769475]: Restore this fix when we can reliably detect Locker enabled
        const isInvalidConstructor = lwcRuntimeFlags.LEGACY_LOCKER_ENABLED
            ? vmBeingConstructed.component !== result
            : !(result instanceof LightningElement);

        if (isInvalidConstructor) {
            throw new TypeError(
                'Invalid component constructor, the class should extend LightningElement.'
            );
        }
    } catch (e) {
        error = Object(e);
    } finally {
        logOperationEnd(OperationId.Constructor, vm);

        vmBeingConstructed = vmBeingConstructedInception;
        if (!isUndefined(error)) {
            addErrorComponentStack(vm, error);
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
        owner,
    } = vm;
    const isRenderBeingInvokedInception = isInvokingRender;
    const vmBeingRenderedInception = getVMBeingRendered();
    let html: Template;
    let renderInvocationSuccessful = false;
    runWithBoundaryProtection(
        vm,
        owner,
        () => {
            // pre
            isInvokingRender = true;
            setVMBeingRendered(vm);
        },
        () => {
            // job
            vm.tro.observe(() => {
                html = callHook(component, render);
                renderInvocationSuccessful = true;
            });
        },
        () => {
            // post
            isInvokingRender = isRenderBeingInvokedInception;
            setVMBeingRendered(vmBeingRenderedInception);
        }
    );
    // If render() invocation failed, process errorCallback in boundary and return an empty template
    return renderInvocationSuccessful ? evaluateTemplate(vm, html!) : [];
}

export function invokeEventListener(
    vm: VM,
    fn: EventListener,
    thisValue: LightningElement | undefined,
    event: Event
) {
    const { callHook, owner } = vm;
    runWithBoundaryProtection(
        vm,
        owner,
        noop,
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
        noop
    );
}
