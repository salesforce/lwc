/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createContextProvider } from '../wire';
import { LightningElement, SYMBOL__SET_INTERNALS } from '../lightning-element';

class FakeAdapter {
    constructor(_cb: any) {}
    update() {}
    connect() {}
    disconnect() {}
}

function createElement() {
    const el = new LightningElement({ tagName: 'x-test' });
    el[SYMBOL__SET_INTERNALS]({}, {}, new Set());
    return el;
}

describe('wire', () => {
    beforeEach(() => {
        (globalThis as any).lwcRuntimeFlags = {};
    });

    afterEach(() => {
        delete (globalThis as any).lwcRuntimeFlags;
    });

    describe('createContextProvider', () => {
        test('throws when called with a non-LightningElement', () => {
            const provide = createContextProvider(FakeAdapter);
            expect(() =>
                provide({} as unknown as LightningElement, {
                    consumerConnectedCallback: () => {},
                })
            ).toThrow(/Unable to register context provider/);
        });

        test('is a no-op when the element is not connected', () => {
            const provide = createContextProvider(FakeAdapter);
            const el = createElement();
            const callback = vi.fn();
            provide(el, { consumerConnectedCallback: callback });
            expect(callback).not.toHaveBeenCalled();
        });

        test('is a no-op when no consumerConnectedCallback is provided', () => {
            const provide = createContextProvider(FakeAdapter);
            const el = createElement();
            el.isConnected = true;
            expect(() => provide(el)).not.toThrow();
            // @ts-expect-error exercising the missing-callback branch
            expect(() => provide(el, {})).not.toThrow();
        });
    });
});
