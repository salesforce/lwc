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

class ContextConnector<T extends object> {
    component: T;
    #renderer: RendererAPI;
    #providedContextVarieties: ContextVarieties;

    constructor(component: T, providedContextVarieties: ContextVarieties, renderer: RendererAPI) {
        this.component = component;
        this.#renderer = renderer;
        this.#providedContextVarieties = providedContextVarieties;
    }

    provideContext<T extends object>(
        contextVariety: T,
        providedContextSignal: Signal<unknown>
    ): void {
        // registerContextProvider is called one time when the component is first provided context.
        // The component is then listening for consumers to consume the provided context.
        if (this.#providedContextVarieties.size === 0) {
            this.#renderer.registerContextProvider(
                this.component,
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

    consumeContext<T extends object>(
        contextVariety: T,
        contextProvidedCallback: ContextProvidedCallback
    ): void {
        this.#renderer.registerContextConsumer(this.component, ContextEventName, {
            setNewContext: (providerContextVarieties: ContextVarieties): ShouldContinueBubbling => {
                // If the provider has the specified context variety, then it is consumed
                // and true is called to stop bubbling.
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
    const { renderer, elm, component } = vm;

    const enumerableKeys = keys(getPrototypeOf(component));
    const contextfulFieldsOrProps = ArrayFilter.call(enumerableKeys, (propName) =>
        isTrustedContext((component as any)[propName])
    );

    if (contextfulFieldsOrProps.length === 0) {
        return;
    }

    const providedContextVarieties: ContextVarieties = new Map();

    for (let i = 0; i < contextfulFieldsOrProps.length; i++) {
        (component as any)[contextfulFieldsOrProps[i]][connectContext](
            new ContextConnector(elm, providedContextVarieties, renderer)
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
    const contextfulFieldsOrProps = ArrayFilter.call(enumerableKeys, (propName) =>
        isTrustedContext((component as any)[propName])
    );

    if (contextfulFieldsOrProps.length === 0) {
        return;
    }

    for (let i = 0; i < contextfulFieldsOrProps.length; i++) {
        (component as any)[contextfulFieldsOrProps[i]][disconnectContext](component);
    }
}
