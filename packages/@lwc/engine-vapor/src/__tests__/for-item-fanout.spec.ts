/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * Regression guard for the whole-template FAN-OUT NARROWING (krausest perf fix).
 *
 * The compat layer enables `setWholeTemplateRerender(true)` so that ANY tracked
 * mutation of a component re-runs ALL of its render effects in the batched flush
 * (engine-core marks the vm dirty → rehydration re-reads every binding). That is
 * required for whole-template parity (observed-fields deep-mutation reflection,
 * side-effect render() re-invoke, scoped-slot reactivity) but, applied to a
 * `for:each`'s per-row bindings, turns a single broadcast field change (e.g.
 * `this.selected = id`) into an O(N) re-run of every row's bindings → O(N^2), the
 * dominant js-framework-benchmark regression (select-row 40x, clear/replace).
 *
 * The fix (`runAsForItem` in renderEffect.ts): a for:each row's OWN bindings are
 * kept fully fine-grained — excluded from the owner's whole-template fan-out set —
 * WITHOUT touching their lifecycle owner. A broadcast field change then re-runs
 * only the row effects that actually read it, not all N rows.
 *
 * These tests exercise the scheduler directly (the src build defaults the flag OFF,
 * so we enable it here to reproduce the compat-layer configuration).
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

import {
    renderEffect,
    runAsForItem,
    setCurrentOwner,
    setEnableAsyncRerender,
    setVueParityAsync,
    setWholeTemplateRerender,
    setAsyncRerenderHooks,
} from '../renderEffect';
import { createReactiveProxy } from '../reactivity';

// Mimic the compat layer's async + whole-template configuration for the duration
// of these tests, then restore the module defaults (flags OFF) afterward.
beforeEach(() => {
    setEnableAsyncRerender(true);
    setVueParityAsync(true);
    setWholeTemplateRerender(true);
    // The async re-notify path only defers when the owner is considered "mounted".
    // Treat every owner as mounted + connected, index 0.
    setAsyncRerenderHooks(
        () => false, // isDisconnected
        () => 0, // ownerIdx
        () => true // isMounted
    );
});

afterEach(() => {
    setEnableAsyncRerender(false);
    setVueParityAsync(false);
    setWholeTemplateRerender(false);
    setCurrentOwner(null);
});

const flush = () => Promise.resolve();

describe('whole-template fan-out narrowing (for:each rows stay fine-grained)', () => {
    test('a broadcast field change re-runs ONLY the row bindings that read it, not all rows', async () => {
        const owner = {};
        const state = createReactiveProxy({ selected: -1 });

        // Simulate N rows, each with two bindings created inside `runAsForItem`
        // (as createFor.mountItem does): a `className` binding that reads the shared
        // `selected` field, and a `label` binding that does NOT. Count re-runs.
        const N = 5;
        const classRuns = new Array(N).fill(0);
        const labelRuns = new Array(N).fill(0);

        const prev = setCurrentOwner(owner);
        for (let row = 0; row < N; row++) {
            runAsForItem(() => {
                renderEffect(() => {
                    // read the shared broadcast field
                    void state.selected;
                    classRuns[row]++;
                });
                renderEffect(() => {
                    // reads nothing shared — a pure per-row label binding
                    labelRuns[row]++;
                });
            });
        }
        setCurrentOwner(prev);

        // Initial run: each effect ran once.
        expect(classRuns).toEqual([1, 1, 1, 1, 1]);
        expect(labelRuns).toEqual([1, 1, 1, 1, 1]);

        // Flip the shared field. Fine-grained: only the 5 className effects (which
        // read `selected`) re-run; the 5 label effects must NOT (they never read it).
        state.selected = 2;
        await flush();

        expect(classRuns).toEqual([2, 2, 2, 2, 2]);
        // The critical assertion: label bindings did NOT fan out.
        expect(labelRuns).toEqual([1, 1, 1, 1, 1]);
    });

    test('a NON-for (top-level) binding STILL fans out across the whole template', async () => {
        const owner = {};
        const state = createReactiveProxy({ a: 0, b: 0 });

        let aRuns = 0;
        let bRuns = 0;

        // Top-level bindings (NOT inside runAsForItem) — these must retain whole-
        // template parity: mutating `a` re-runs the `b` binding too.
        const prev = setCurrentOwner(owner);
        renderEffect(() => {
            void state.a;
            aRuns++;
        });
        renderEffect(() => {
            void state.b;
            bRuns++;
        });
        setCurrentOwner(prev);

        expect(aRuns).toBe(1);
        expect(bRuns).toBe(1);

        // Mutate `a`. Whole-template fan-out: the `b` binding re-runs even though it
        // does not read `a`.
        state.a = 1;
        await flush();

        expect(aRuns).toBe(2);
        expect(bRuns).toBe(2); // fanned out — parity preserved
    });

    test('a nested child component inside a row still fans out (owner boundary respected)', async () => {
        const listOwner = {};
        const childOwner = {};
        const state = createReactiveProxy({ x: 0 });

        let rowRuns = 0;
        let childReadRuns = 0;
        let childOtherRuns = 0;

        const prev = setCurrentOwner(listOwner);
        runAsForItem(() => {
            // A plain per-row binding owned by the list — fine-grained (excluded).
            renderEffect(() => {
                rowRuns++;
            });
            // A NESTED child component's bindings: the child sets its own owner while
            // rendering, so `effect.owner !== forItemOwner` and they must STILL register
            // for whole-template fan-out under the child.
            const prevChild = setCurrentOwner(childOwner);
            renderEffect(() => {
                void state.x;
                childReadRuns++;
            });
            renderEffect(() => {
                childOtherRuns++;
            });
            setCurrentOwner(prevChild);
        });
        setCurrentOwner(prev);

        expect(rowRuns).toBe(1);
        expect(childReadRuns).toBe(1);
        expect(childOtherRuns).toBe(1);

        // Mutate `x`, read by one child binding. Within the CHILD owner, whole-
        // template fan-out re-runs the sibling child binding too.
        state.x = 1;
        await flush();

        expect(childReadRuns).toBe(2);
        expect(childOtherRuns).toBe(2); // child sibling fanned out
        // The list-owned row binding did NOT fan out from the child's mutation.
        expect(rowRuns).toBe(1);
    });
});
