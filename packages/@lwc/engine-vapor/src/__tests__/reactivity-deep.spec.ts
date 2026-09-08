/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, vi } from 'vitest';
import { reactive, toRaw } from '../reactivity';
import { renderEffect } from '../renderEffect';

describe('deep reactivity membrane', () => {
    test('tracks nested object property reads/writes', () => {
        const state = reactive({ user: { name: 'Ada', age: 36 } });
        const seen: string[] = [];
        renderEffect(() => seen.push(state.user.name));
        expect(seen).toEqual(['Ada']);

        state.user.name = 'Grace';
        expect(seen).toEqual(['Ada', 'Grace']);
    });

    test('does not re-run for unread nested keys', () => {
        const state = reactive({ user: { name: 'Ada', age: 36 } });
        const fn = vi.fn(() => state.user.name);
        renderEffect(fn);
        expect(fn).toHaveBeenCalledTimes(1);

        state.user.age = 99;
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('array push triggers length/iteration dependents', () => {
        const state = reactive({ items: [1, 2, 3] });
        const lengths: number[] = [];
        renderEffect(() => lengths.push(state.items.length));
        expect(lengths).toEqual([3]);

        state.items.push(4);
        expect(lengths).toEqual([3, 4]);
    });

    test('array index assignment is reactive', () => {
        const state = reactive({ items: ['a', 'b', 'c'] });
        const seen: string[] = [];
        renderEffect(() => seen.push(state.items[0]));
        expect(seen).toEqual(['a']);

        state.items[0] = 'z';
        expect(seen).toEqual(['a', 'z']);
    });

    test('splice/unshift/shift are reactive', () => {
        const state = reactive({ items: [1, 2, 3, 4, 5] });
        const snapshots: number[][] = [];
        renderEffect(() => snapshots.push([...state.items]));
        expect(snapshots[0]).toEqual([1, 2, 3, 4, 5]);

        state.items.splice(1, 2); // remove 2,3
        expect(snapshots[snapshots.length - 1]).toEqual([1, 4, 5]);

        state.items.unshift(0);
        expect(snapshots[snapshots.length - 1]).toEqual([0, 1, 4, 5]);

        state.items.shift();
        expect(snapshots[snapshots.length - 1]).toEqual([1, 4, 5]);
    });

    test('mutating an object inside an array re-runs dependents', () => {
        const state = reactive({ rows: [{ id: 1, label: 'a' }] });
        const labels: string[] = [];
        renderEffect(() => labels.push(state.rows[0].label));
        expect(labels).toEqual(['a']);

        state.rows[0].label = 'b';
        expect(labels).toEqual(['a', 'b']);
    });

    test('proxy identity is stable', () => {
        const state = reactive({ nested: { x: 1 } });
        expect(state.nested).toBe(state.nested);
    });

    test('toRaw unwraps a reactive proxy', () => {
        const raw = { a: 1 };
        const proxy = reactive(raw);
        expect(toRaw(proxy)).toBe(raw);
    });

    test('writing a reactive value stores the raw underneath', () => {
        const state = reactive<{ child: { v: number } | null }>({ child: null });
        const child = reactive({ v: 1 });
        state.child = child;
        // Stored raw, but reads return a (stable) reactive wrapper.
        expect(toRaw(state).child).toEqual({ v: 1 });
    });
});
