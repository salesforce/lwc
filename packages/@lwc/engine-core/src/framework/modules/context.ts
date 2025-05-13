/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    getPrototypeOf,
    keys,
    getContextKeys,
    ArrayFilter,
    ContextEventName,
    isTrustedContext,
} from '@lwc/shared';
import { type VM } from '../vm';
import { logErrorOnce } from '../../shared/logger';
import type { Signal } from '@lwc/signals';
import type { RendererAPI } from '../renderer';
import type { ShouldContinueBubbling } from '../wiring/types';

type ContextProvidedCallback = (contextSignal?: Signal<unknown>) => void;
type ContextVarieties = Map<unknown, Signal<unknown>>;

class ContextConnector<C extends object> {
    component: C;
    #renderer: RendererAPI;
    #providedContextVarieties: ContextVarieties;
    #elm: HTMLElement;

    constructor(vm: VM, component: C, providedContextVarieties: ContextVarieties) {
        this.component = component;
        this.#renderer = vm.renderer;
        this.#elm = vm.elm;
        this.#providedContextVarieties = providedContextVarieties;
    }

    provideContext<V extends object>(
        contextVariety: V,
        providedContextSignal: Signal<unknown>
    ): void {
        // registerContextProvider is called one time when the component is first provided context.
        // The component is then listening for consumers to consume the provided context.
        if (this.#providedContextVarieties.size === 0) {
            this.#renderer.registerContextProvider(
                this.#elm,
                ContextEventName,
                (payload): ShouldContinueBubbling => {
                    // This callback is invoked when the provided context is consumed somewhere down
                    // in the component's subtree.
                    return payload.setNewContext(this.#providedContextVarieties);
                }
            );
        }

        if (this.#providedContextVarieties.has(contextVariety)) {
            logErrorOnce(
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
    const contextKeys = getContextKeys();

    if (isUndefined(contextKeys)) {
        return;
    }

    const { connectContext } = contextKeys;
    const { component } = vm;

    const enumerableKeys = keys(getPrototypeOf(component));
    const contextfulKeys = ArrayFilter.call(enumerableKeys, (enumerableKey) =>
        isTrustedContext((component as any)[enumerableKey])
    );

    if (contextfulKeys.length === 0) {
        return;
    }

    const providedContextVarieties: ContextVarieties = new Map();

    for (let i = 0; i < contextfulKeys.length; i++) {
        (component as any)[contextfulKeys[i]][connectContext](
            new ContextConnector(vm, component, providedContextVarieties)
        );
    }
}

export function disconnectContext(vm: VM) {
    const contextKeys = getContextKeys();

    if (!contextKeys) {
        return;
    }

    const { disconnectContext } = contextKeys;
    const { component } = vm;

    const enumerableKeys = keys(getPrototypeOf(component));
    const contextfulKeys = ArrayFilter.call(enumerableKeys, (enumerableKey) =>
        isTrustedContext((component as any)[enumerableKey])
    );

    if (contextfulKeys.length === 0) {
        return;
    }

    for (let i = 0; i < contextfulKeys.length; i++) {
        (component as any)[contextfulKeys[i]][disconnectContext](component);
    }
}
