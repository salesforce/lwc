/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, vi } from 'vitest';
import { renderEffect, batch } from '../renderEffect';
import { createReactiveProxy } from '../reactivity';

describe('renderEffect', () => {
    test('executes immediately', () => {
        const fn = vi.fn();
        renderEffect(fn);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('re-runs when tracked reactive value changes', () => {
        const state = createReactiveProxy({ count: 0 });
        const values: number[] = [];

        renderEffect(() => {
            values.push(state.count);
        });

        expect(values).toEqual([0]);

        state.count = 1;
        expect(values).toEqual([0, 1]);

        state.count = 2;
        expect(values).toEqual([0, 1, 2]);
    });

    test('does not re-run for untracked properties', () => {
        const state = createReactiveProxy({ a: 1, b: 2 });
        const fn = vi.fn(() => state.a);

        renderEffect(fn);
        expect(fn).toHaveBeenCalledTimes(1);

        state.b = 99;
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('batches multiple updates', () => {
        const state = createReactiveProxy({ a: 1, b: 2 });
        const fn = vi.fn(() => state.a + state.b);

        renderEffect(fn);
        expect(fn).toHaveBeenCalledTimes(1);

        batch(() => {
            state.a = 10;
            state.b = 20;
        });
        // Should only run once after batch
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('handles nested reactive access', () => {
        const state = createReactiveProxy({ show: true, message: 'hello' });
        const results: string[] = [];

        renderEffect(() => {
            if (state.show) {
                results.push(state.message);
            } else {
                results.push('hidden');
            }
        });

        expect(results).toEqual(['hello']);

        state.message = 'world';
        expect(results).toEqual(['hello', 'world']);

        state.show = false;
        expect(results).toEqual(['hello', 'world', 'hidden']);
    });
});
