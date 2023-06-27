/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    isFalse,
    isFunction,
    isUndefined,
    APIVersion,
    LOWEST_API_VERSION,
} from '@lwc/shared';

import { createReactiveObserver, ReactiveObserver } from './mutation-tracker';

import { invokeComponentRenderMethod, isInvokingRender, invokeEventListener } from './invoker';
import { VM, scheduleRehydration } from './vm';
import { LightningElementConstructor } from './base-lightning-element';
import { Template, isUpdatingTemplate, getVMBeingRendered } from './template';
import { VNodes } from './vnodes';
import { checkVersionMismatch } from './check-version-mismatch';

type ComponentConstructorMetadata = {
    tmpl: Template;
    sel: string;
    apiVersion: APIVersion;
};
const registeredComponentMap: Map<LightningElementConstructor, ComponentConstructorMetadata> =
    new Map();

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerComponent(
    // We typically expect a LightningElementConstructor, but technically you can call this with anything
    Ctor: any,
    metadata: ComponentConstructorMetadata
): any {
    if (isFunction(Ctor)) {
        if (process.env.NODE_ENV !== 'production') {
            // There is no point in running this in production, because the version mismatch check relies
            // on code comments which are stripped out in production by minifiers
            checkVersionMismatch(Ctor, 'component');
        }
        // TODO [#3331]: add validation to check the value of metadata.sel is not an empty string.
        registeredComponentMap.set(Ctor, metadata);
    }
    // chaining this method as a way to wrap existing assignment of component constructor easily,
    // without too much transformation
    return Ctor;
}

export function getComponentRegisteredTemplate(
    Ctor: LightningElementConstructor
): Template | undefined {
    return registeredComponentMap.get(Ctor)?.tmpl;
}

export function getComponentRegisteredName(Ctor: LightningElementConstructor): string | undefined {
    return registeredComponentMap.get(Ctor)?.sel;
}

export function getComponentAPIVersion(Ctor: LightningElementConstructor): APIVersion {
    const metadata = registeredComponentMap.get(Ctor);
    const apiVersion: APIVersion | undefined = metadata?.apiVersion;

    if (isUndefined(apiVersion)) {
        // This should only occur in our Karma tests; in practice every component
        // is registered, and so this code path should not get hit. But to be safe,
        // return the lowest possible version.
        return LOWEST_API_VERSION;
    }
    return apiVersion;
}

export function getTemplateReactiveObserver(vm: VM): ReactiveObserver {
    return createReactiveObserver(() => {
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
        throw new TypeError('Expected an EventListener but received ' + typeof listener); // avoiding problems with non-valid listeners
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
