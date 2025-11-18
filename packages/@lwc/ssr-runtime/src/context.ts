/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    type ContextProvidedCallback,
    type ContextBinding as IContextBinding,
    isTrustedContext,
    getContextKeys,
    isUndefined,
    keys,
} from '@lwc/shared';
import { getContextfulStack } from './wire';
import { type LightningElement, SYMBOL__CONTEXT_VARIETIES } from './lightning-element';
import type { Signal } from '@lwc/signals';

class ContextBinding<C extends LightningElement> implements IContextBinding<LightningElement> {
    component: C;

    constructor(component: C) {
        this.component = component;
    }

    provideContext<V extends object>(
        contextVariety: V,
        providedContextSignal: Signal<unknown>
    ): void {
        const contextVarieties = this.component[SYMBOL__CONTEXT_VARIETIES];
        if (contextVarieties.has(contextVariety)) {
            if (process.env.NODE_ENV !== 'production') {
                throw new Error('Multiple contexts of the same variety were provided.');
            }
            return;
        }
        contextVarieties.set(contextVariety, providedContextSignal);
    }

    consumeContext<V extends object>(
        contextVariety: V,
        contextProvidedCallback: ContextProvidedCallback
    ): void {
        const contextfulStack = getContextfulStack(this.component);
        for (const ancestor of contextfulStack) {
            // If the ancestor has the specified context variety, consume it and stop searching
            const ancestorContextVarieties = ancestor[SYMBOL__CONTEXT_VARIETIES];
            if (ancestorContextVarieties.has(contextVariety)) {
                contextProvidedCallback(ancestorContextVarieties.get(contextVariety));
                break;
            }
        }
    }
}

export { ContextBinding };

export function connectContext(le: LightningElement) {
    const contextKeys = getContextKeys();

    if (isUndefined(contextKeys)) {
        return;
    }

    const { connectContext } = contextKeys;

    const enumerableKeys = keys(le);
    // I'm not sure why, but changing this makes tests fail...
    // eslint-disable-next-line @lwc/lwc-internal/no-normal-code
    const contextfulKeys = Array.prototype.filter.call(enumerableKeys, (enumerableKey) =>
        isTrustedContext((le as any)[enumerableKey])
    );

    if (contextfulKeys.length === 0) {
        return;
    }

    try {
        for (let i = 0; i < contextfulKeys.length; i++) {
            (le as any)[contextfulKeys[i]][connectContext](new ContextBinding(le));
        }
    } catch (err: any) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(
                `Attempted to connect to trusted context but received the following error: ${
                    err.message
                }`
            );
        }
    }
}
