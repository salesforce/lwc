/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    keys,
    getContextKeys,
    ArrayFilter,
    ContextEventName,
    isTrustedContext,
    type ContextProvidedCallback,
    type ContextBinding as IContextBinding,
} from '@lwc/shared';
import { type VM } from '../vm';
import { logWarnOnce } from '../../shared/logger';
import type { Signal } from '@lwc/signals';
import type { RendererAPI } from '../renderer';
import type { ShouldContinueBubbling } from '../wiring/types';

type ContextVarieties = Map<unknown, Signal<unknown>>;

class ContextBinding<C extends object> implements IContextBinding<C> {
    component: C;
    #renderer: RendererAPI;
    #providedContextVarieties: ContextVarieties;
    #elm: HTMLElement;

    constructor(vm: VM, component: C, providedContextVarieties: ContextVarieties) {
        this.component = component;
        this.#renderer = vm.renderer;
        this.#elm = vm.elm;
        this.#providedContextVarieties = providedContextVarieties;

        // Register the component as a context provider.
        this.#renderer.registerContextProvider(
            this.#elm,
            ContextEventName,
            (contextConsumer): ShouldContinueBubbling => {
                // This callback is invoked when the provided context is consumed somewhere down
                // in the component's subtree.
                return contextConsumer.setNewContext(this.#providedContextVarieties);
            }
        );
    }

    provideContext<V extends object>(
        contextVariety: V,
        providedContextSignal: Signal<unknown>
    ): void {
        if (this.#providedContextVarieties.has(contextVariety)) {
            logWarnOnce(
                'Multiple contexts of the same variety were provided. Only the first context will be used.'
            );
            return;
        }
        this.#providedContextVarieties.set(contextVariety, providedContextSignal);
    }

    consumeContext<V extends object>(
        contextVariety: V,
        contextProvidedCallback: ContextProvidedCallback
    ): void {
        this.#renderer.registerContextConsumer(this.#elm, ContextEventName, {
            setNewContext: (providerContextVarieties: ContextVarieties): ShouldContinueBubbling => {
                // If the provider has the specified context variety, then it is consumed
                // and true is returned to stop bubbling.
                if (providerContextVarieties.has(contextVariety)) {
                    contextProvidedCallback(providerContextVarieties.get(contextVariety));
                    return true;
                }
                // Return false as context has not been found/consumed
                // and the consumer should continue traversing the context tree
                return false;
            },
        });
    }
}

export function connectContext(vm: VM) {
    // Non-decorated objects
    connect(vm, vm.cmpFields);
    // Decorated objects like @api context
    connect(vm, vm.cmpProps);
}

export function disconnectContext(vm: VM) {
    // Non-decorated objects
    disconnect(vm, vm.cmpFields);
    // Decorated objects like @api context
    disconnect(vm, vm.cmpProps);
}

function connect(
    vm: VM,
    fieldsOrProps: {
        [name: string]: any;
    }
) {
    const contextKeys = getContextKeys();

    if (isUndefined(contextKeys)) {
        return;
    }

    const { connectContext } = contextKeys;

    const { component } = vm;

    const enumerableKeys = keys(fieldsOrProps);
    const contextfulKeys = ArrayFilter.call(enumerableKeys, (enumerableKey) =>
        isTrustedContext(fieldsOrProps[enumerableKey])
    );

    if (contextfulKeys.length === 0) {
        return;
    }

    const providedContextVarieties: ContextVarieties = new Map();

    try {
        for (let i = 0; i < contextfulKeys.length; i++) {
            fieldsOrProps[contextfulKeys[i]][connectContext](
                new ContextBinding(vm, component, providedContextVarieties)
            );
        }
    } catch (err: any) {
        logWarnOnce(
            `Attempted to connect to trusted context but received the following error: ${
                err.message
            }`
        );
    }
}

function disconnect(
    vm: VM,
    fieldsOrProps: {
        [name: string]: any;
    }
) {
    const contextKeys = getContextKeys();

    if (!contextKeys) {
        return;
    }

    const { disconnectContext } = contextKeys;

    const { component } = vm;

    const enumerableKeys = keys(fieldsOrProps);
    const contextfulKeys = ArrayFilter.call(enumerableKeys, (enumerableKey) =>
        isTrustedContext(fieldsOrProps[enumerableKey])
    );

    if (contextfulKeys.length === 0) {
        return;
    }

    try {
        for (let i = 0; i < contextfulKeys.length; i++) {
            fieldsOrProps[contextfulKeys[i]][disconnectContext](component);
        }
    } catch (err: any) {
        logWarnOnce(
            `Attempted to disconnect from trusted context but received the following error: ${
                err.message
            }`
        );
    }
}
