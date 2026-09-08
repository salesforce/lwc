/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): quantifies compiler effect-batching for the
 * js-framework-benchmark create/update path. The compiled krausest row emits FOUR
 * bindings — setProp(tr,data-id), setClass(tr), setText(id), setText(label). The
 * template-compiler-vapor `batchEffects` pass merges CONSECUTIVE SAME-REF bindings, so
 * the two `<tr>`-targeted ops (data-id + class) fold into ONE renderEffect → the row
 * goes 4 effects → 3 (the two text nodes keep their own effects, different refs).
 *
 * This bench mounts the identical per-row reactive reads three ways and then simulates
 * a `select-row` update (flip a shared `selected` field → every row's className
 * re-evaluates) to PROVE the merge doesn't regress the update ops vapor already wins:
 *   - 4 separate effects  (status quo)
 *   - 3 effects, same-ref merge  (what the compiler now emits)
 *   - 1 effect, cross-ref merge  (rejected — shown for contrast; expands the dep set)
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench mount-batching-microbench --run
 * Read min + throughput(hz) (GC-robust), NOT mean (GC-polluted).
 */
import { bench, describe } from 'vitest';

import { renderEffect, runAsForItem, setCurrentOwner } from '../renderEffect';
import { reactive } from '../reactivity';
import { shallowRef, type ShallowRef } from '../ref';
import { EffectScope } from '../scope';

function makeState(rowCount: number) {
    const component = { selected: -1 as number } as { selected: number };
    const rows: Array<{ id: number; label: string; className: string }> = [];
    for (let i = 0; i < rowCount; i++) {
        rows.push({
            id: i + 1,
            label: 'adjective colour noun',
            get className(this: { id: number }) {
                return this.id === component.selected ? 'danger' : '';
            },
        });
    }
    const reactiveComponent = reactive(component);
    void reactiveComponent.selected;
    return { rows: reactive(rows), component: reactiveComponent };
}

// STATUS QUO: four separate renderEffects, one per binding (4 ReactiveEffects/row).
function mountRow4(item: any) {
    const scope = new EffectScope();
    const itemRef: ShallowRef<any> = shallowRef(item);
    scope.run(() =>
        runAsForItem(() => {
            const row = itemRef.value;
            renderEffect(() => void row.id); // setProp data-id (tr)
            renderEffect(() => void row.className); // setClass (tr)
            renderEffect(() => void row.id); // setText id (td text node)
            renderEffect(() => void row.label); // setText label (a text node)
        })
    );
    return scope;
}

// SAME-REF MERGE (what the compiler emits): the two <tr> ops share one effect; the two
// text nodes keep their own. 4 → 3 effects. The merged effect's dep set is {id, className}
// — className already reads `selected`, and data-id reads id: both are `<tr>` deps that
// were always going to be present. No dep-set EXPANSION beyond the same element.
function mountRow3(item: any) {
    const scope = new EffectScope();
    const itemRef: ShallowRef<any> = shallowRef(item);
    scope.run(() =>
        runAsForItem(() => {
            const row = itemRef.value;
            renderEffect(() => {
                void row.id; // setProp data-id (tr)
                void row.className; // setClass (tr)
            });
            renderEffect(() => void row.id); // setText id (td text node)
            renderEffect(() => void row.label); // setText label (a text node)
        })
    );
    return scope;
}

// CROSS-REF MERGE (REJECTED): all four reads in one effect. Cheapest mount, but the
// label text effect now transitively subscribes to `selected` (via className) — so a
// select-row flip re-runs an effect that also touches label/id. Shown to justify the
// conservative same-ref choice.
function mountRow1(item: any) {
    const scope = new EffectScope();
    const itemRef: ShallowRef<any> = shallowRef(item);
    scope.run(() =>
        runAsForItem(() => {
            const row = itemRef.value;
            renderEffect(() => {
                void row.id;
                void row.className;
                void row.id;
                void row.label;
            });
        })
    );
    return scope;
}

function mountAll(rowCount: number, mountRow: (item: any) => EffectScope) {
    const { rows } = makeState(rowCount);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes: EffectScope[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
        scopes[i] = mountRow(rows[i]);
    }
    setCurrentOwner(prev);
    for (let i = 0; i < rowCount; i++) scopes[i].stop();
}

// UPDATE PATH: mount once, then flip `selected` back and forth N times. Every flip
// notifies the className dep → re-runs the className-bearing effect on the affected
// rows. With per-op memoization, the merged effect's non-className ops (data-id, id, label)
// are cheap equality skips, so 3-effect and 4-effect should be ~equal on updates.
function selectChurn(rowCount: number, mountRow: (item: any) => EffectScope, flips: number) {
    const { rows, component } = makeState(rowCount);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes: EffectScope[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) scopes[i] = mountRow(rows[i]);
    setCurrentOwner(prev);
    for (let f = 0; f < flips; f++) {
        component.selected = f % 2 === 0 ? (f % rowCount) + 1 : -1;
    }
    for (let i = 0; i < rowCount; i++) scopes[i].stop();
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 800, teardown } as const;

describe('for:each mount — effect batching (create path)', () => {
    bench('10k rows · 4 effects/row (status quo)', () => mountAll(10000, mountRow4), OPTS);
    bench('10k rows · 3 effects/row (same-ref, emitted)', () => mountAll(10000, mountRow3), OPTS);
    bench('10k rows · 1 effect/row (cross-ref, rejected)', () => mountAll(10000, mountRow1), OPTS);
});

describe('for:each select-row — effect batching (update path, no-regression check)', () => {
    // 1k rows, 200 select flips — the deps that fire are className (→ selected).
    bench('1k rows · 4 effects/row · 200 flips', () => selectChurn(1000, mountRow4, 200), OPTS);
    bench('1k rows · 3 effects/row · 200 flips', () => selectChurn(1000, mountRow3, 200), OPTS);
    bench('1k rows · 1 effect/row · 200 flips', () => selectChurn(1000, mountRow1, 200), OPTS);
});
