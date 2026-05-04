/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createContextProvider } from '../wire';
import { LightningElement, SYMBOL__SET_INTERNALS } from '../lightning-element';
import type { WireAdapterConstructor } from '@lwc/engine-core';

class FakeAdapter {
    update() {}
    connect() {}
    disconnect() {}
}
const fakeAdapter: WireAdapterConstructor = FakeAdapter;

function createElement() {
    const el = new LightningElement({ tagName: 'x-test' });
    el[SYMBOL__SET_INTERNALS]({}, {}, new Set());
    return el;
}

describe('wire', () => {
    beforeEach(() => {
        if (!(globalThis as any).lwcRuntimeFlags) {
            (globalThis as any).lwcRuntimeFlags = {};
        }
    });

    describe('createContextProvider', () => {
        test('throws when called with a non-LightningElement', () => {
            const provide = createContextProvider(fakeAdapter);
            expect(() =>
                provide({} as unknown as LightningElement, {
                    consumerConnectedCallback: () => {},
                })
            ).toThrow(/Unable to register context provider/);
        });

        test('is a no-op when the element is not connected', () => {
            const provide = createContextProvider(fakeAdapter);
            const el = createElement();
            const callback = vi.fn();
            provide(el, { consumerConnectedCallback: callback });
            expect(callback).not.toHaveBeenCalled();
        });

        test('is a no-op when no consumerConnectedCallback is provided', () => {
            const provide = createContextProvider(fakeAdapter);
            const el = createElement();
            el.isConnected = true;
            expect(() => provide(el)).not.toThrow();
            // @ts-expect-error exercising the missing-callback branch
            expect(() => provide(el, {})).not.toThrow();
        });
    });
});
