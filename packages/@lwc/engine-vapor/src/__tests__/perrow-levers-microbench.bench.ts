/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): isolates the TWO remaining per-row mount levers
 * for the js-framework-benchmark create path, so numbers — not intuition — decide which
 * (if either) is worth a compiler change + full WTR gate. Mirrors what
 * `createFor.mountItem` does per row, but as pure reactivity setup (no DOM; DOM cost is
 * identical across variants). Reflects the POST-c4a9cc006 reality: the compiled krausest
 * row emits THREE renderEffects, not four —
 *     E1: setProp(n22,data-id,row.id) + setClass(n22,row.className)   → tracks {id, className}
 *     E2: setText(n24, row.id)                                        → tracks {id}
 *     E3: setText(n27, row.label)                                     → tracks {label}
 *
 * LEVER 1 — itemProxy elimination: today each row wraps its item in `new Proxy()`; the
 *   row bindings read `row.id` etc. THROUGH the proxy get-trap. A compiler change could
 *   emit `itemRef.value.id` directly (Vue's model), dropping the per-row Proxy alloc +
 *   trap dispatch. Variants: PROXY (current) vs DIRECT (ref.value reads).
 *
 * LEVER 2 — cross-node effect fold (E2→E1): E1 and E2 BOTH read the immutable `row.id`.
 *   Merging E2 into E1 yields 2 effects/row instead of 3 — saving one ReactiveEffect
 *   alloc + one `ownerEffects.add` + collapsing id-dep's subscriber set from {E1,E2} to
 *   {E1'} — WITHOUT touching the label path, so the winning partial-update op is
 *   unaffected (E3 still the sole label reader). Variants: 3-EFFECT vs 2-EFFECT.
 *
 * The 2×2 grid attributes the win to each lever independently. Run:
 *   NODE_OPTIONS="--expose-gc" yarn vitest bench perrow-levers-microbench --run
 */
import { bench, describe } from 'vitest';

import { renderEffect, runAsForItem, setCurrentOwner } from '../renderEffect';
import { reactive } from '../reactivity';
import { shallowRef, type ShallowRef } from '../ref';
import { EffectScope } from '../scope';

// REF symbol + handler mirror createFor.ts's itemProxy exactly (method-binding branch
// included — it's a no-op for data-only rows, which is the point: it costs ~nothing for
// krausest, so stripping it (agent option b) can't help; only dropping the Proxy can).
const REF = Symbol('itemRef');
type ItemProxyTarget = { [REF]: ShallowRef<any> };
const itemProxyHandler: ProxyHandler<ItemProxyTarget> = {
    get(t, key) {
        const current = t[REF].value as any;
        if (key === Symbol.toPrimitive) return () => current;
        if (current == null) return undefined;
        const v = current[key];
        if (typeof v === 'function') {
            const desc = Object.getOwnPropertyDescriptor(v, 'prototype');
            const isClass = desc !== undefined && desc.writable === false;
            return isClass ? v : v.bind(current);
        }
        return v;
    },
};
function itemProxy(ref: ShallowRef<any>): any {
    return new Proxy({ [REF]: ref } as ItemProxyTarget, itemProxyHandler);
}

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

// The 4 mount variants. `useProxy` toggles LEVER 1; `fold` toggles LEVER 2.
function mountRow(item: any, useProxy: boolean, fold: boolean) {
    const scope = new EffectScope();
    const itemRef: ShallowRef<any> = shallowRef(item);
    const indexRef: ShallowRef<number> = shallowRef(0);
    void indexRef;
    scope.run(() =>
        runAsForItem(() => {
            // `row` is either the Proxy (current) or the raw ref read via `.value`.
            const row = useProxy ? itemProxy(itemRef) : null;
            const readId = useProxy ? () => row.id : () => itemRef.value.id;
            const readClass = useProxy ? () => row.className : () => itemRef.value.className;
            const readLabel = useProxy ? () => row.label : () => itemRef.value.label;

            if (fold) {
                // 2 effects: E1' folds the two id-readers (id read twice, tracked once).
                renderEffect(() => {
                    void readId(); // setProp data-id
                    void readClass(); // setClass
                    void readId(); // setText id (folded in)
                });
                renderEffect(() => {
                    void readLabel(); // setText label
                });
            } else {
                // 3 effects: the current post-c4a9cc006 shape.
                renderEffect(() => {
                    void readId();
                    void readClass();
                });
                renderEffect(() => {
                    void readId();
                });
                renderEffect(() => {
                    void readLabel();
                });
            }
        })
    );
    return scope;
}

function mountAll(rowCount: number, useProxy: boolean, fold: boolean) {
    const { rows } = makeState(rowCount);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes: EffectScope[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
        scopes[i] = mountRow(rows[i], useProxy, fold);
    }
    setCurrentOwner(prev);
    for (let i = 0; i < rowCount; i++) scopes[i].stop();
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const OPTS = { time: 3000, warmupTime: 800, teardown: () => gc?.() } as const;

// 1k grid — the create-1k op. Each variant labeled so the ratio reads directly.
describe('per-row levers @ 1k rows', () => {
    bench('A current: PROXY + 3 effects', () => mountAll(1000, true, false), OPTS);
    bench('B fold:    PROXY + 2 effects', () => mountAll(1000, true, true), OPTS);
    bench('C noproxy: DIRECT + 3 effects', () => mountAll(1000, false, false), OPTS);
    bench('D both:    DIRECT + 2 effects', () => mountAll(1000, false, true), OPTS);
});

// 10k grid — the create-10k op (amplifies per-row deltas above sample noise).
describe('per-row levers @ 10k rows', () => {
    bench('A current: PROXY + 3 effects', () => mountAll(10000, true, false), OPTS);
    bench('B fold:    PROXY + 2 effects', () => mountAll(10000, true, true), OPTS);
    bench('C noproxy: DIRECT + 3 effects', () => mountAll(10000, false, false), OPTS);
    bench('D both:    DIRECT + 2 effects', () => mountAll(10000, false, true), OPTS);
});
