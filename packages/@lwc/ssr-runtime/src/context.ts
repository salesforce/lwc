/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isTrustedContext, getContextKeys, isUndefined, keys } from "@lwc/shared";
import { getContextfulStack } from "./wire";
import { type LightningElement, SYMBOL__CONTEXT_VARIETIES } from "./lightning-element";
import type { Signal } from "@lwc/signals";
import type { ContextProvidedCallback, ContextBinding as IContextBinding } from '@lwc/shared';
import type { Properties } from './types';

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
                throw new Error('Multiple contexts of the same variety were provided. Only the first context will be used.');
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

export function connectContext(le: LightningElement, props: Properties) {
    const contextKeys = getContextKeys();
    if (isUndefined(contextKeys)) {
        return;
    }
    const { connectContext } = contextKeys;
    let hasTrustedContext = false;
    for (const propName of keys(props)) {
        const propValue = props[propName] as any;
        if (isTrustedContext(propValue)) {
            hasTrustedContext = true;
            propValue[connectContext](new ContextBinding(le));
        }
    }
    if (hasTrustedContext) {
        le[SYMBOL__CONTEXT_VARIETIES] = new Map();
    }
}