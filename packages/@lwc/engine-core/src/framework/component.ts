/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isArray, isFalse, isFunction, isUndefined } from '@lwc/shared';
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isInvokingRender,
    invokeEventListener,
} from './invoker';
import { VM, scheduleRehydration } from './vm';
import { VNodes } from '../3rdparty/snabbdom/types';
import { ReactiveObserver } from '../libs/mutation-tracker';
import { LightningElementConstructor } from './base-lightning-element';
import { Template, isUpdatingTemplate, getVMBeingRendered } from './template';

const signedTemplateMap: Map<LightningElementConstructor, Template> = new Map();

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerComponent(
    Ctor: LightningElementConstructor,
    { tmpl }: { tmpl: Template }
): LightningElementConstructor {
    signedTemplateMap.set(Ctor, tmpl);
    // chaining this method as a way to wrap existing assignment of component constructor easily,
    // without too much transformation
    return Ctor;
}

export function getComponentRegisteredTemplate(
    Ctor: LightningElementConstructor
): Template | undefined {
    return signedTemplateMap.get(Ctor);
}

export function createComponent(vm: VM, Ctor: LightningElementConstructor) {
    // create the component instance
    invokeComponentConstructor(vm, Ctor);

    if (isUndefined(vm.component)) {
        throw new ReferenceError(
            `Invalid construction for ${Ctor}, you must extend LightningElement.`
        );
    }
}

export function getTemplateReactiveObserver(vm: VM): ReactiveObserver {
    return new ReactiveObserver(() => {
        const { isDirty } = vm;
        if (isFalse(isDirty)) {
            markComponentAsDirty(vm);
            scheduleRehydration(vm);
        }
    });
}

export function renderComponent(vm: VM): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    }

    vm.tro.reset();
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    vm.isScheduled = false;

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isArray(vnodes),
            `${vm}.render() should always return an array of vnodes instead of ${vnodes}`
        );
    }
    return vnodes;
}

export function markComponentAsDirty(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        const vmBeingRendered = getVMBeingRendered();
        assert.isFalse(
            vm.isDirty,
            `markComponentAsDirty() for ${vm} should not be called when the component is already dirty.`
        );
        assert.isFalse(
            isInvokingRender,
            `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`
        );
        assert.isFalse(
            isUpdatingTemplate,
            `markComponentAsDirty() for ${vm} cannot be called while updating template of ${vmBeingRendered}.`
        );
    }
    vm.isDirty = true;
}

const cmpEventListenerMap: WeakMap<EventListener, EventListener> = new WeakMap();

export function getWrappedComponentsListener(vm: VM, listener: EventListener): EventListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let wrappedListener = cmpEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function (event: Event) {
            invokeEventListener(vm, listener, undefined, event);
        };
        cmpEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}
