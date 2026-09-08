/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): isolates the per-row reactivity SETUP cost of
 * the js-framework-benchmark create-1k/10k mount path, WITHOUT the DOM/browser noise
 * that makes the @best create-10k op drift ~6% cross-session. It replays exactly what
 * `createFor.mountItem` does per row — a fresh EffectScope, two shallowRefs, an item
 * proxy, and the FOUR renderEffects the compiled table row emits (data-id, className,
 * text=id, text=label) — each reading reactive fields so `track()`/`addDep` run for
 * real. Run: `yarn vitest bench mount-microbench`.
 */
import { bench, describe } from 'vitest';

import { renderEffect, runAsForItem, setCurrentOwner } from '../renderEffect';
import { reactive } from '../reactivity';
import { shallowRef, type ShallowRef } from '../ref';
import { EffectScope } from '../scope';

// A row object shaped like the krausest data: id + label + a `className` getter that
// reads a shared broadcast field (`selected`) on the "component", exactly like the
// compiled benchmark's `get className()`.
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
    // The for:each source is the reactive array; reading rows[i] returns a deep-reactive
    // proxy of the row (the double-membrane the real mount crosses).
    const reactiveComponent = reactive(component);
    void reactiveComponent.selected; // ensure the component proxy exists
    return { rows: reactive(rows), component: reactiveComponent };
}

// Minimal stand-in for createFor.mountItem's per-row work. We don't build DOM (the DOM
// cost is identical between engine variants — it's the reactivity setup we're isolating).
function mountRow(item: any) {
    const scope = new EffectScope();
    const itemRef: ShallowRef<any> = shallowRef(item);
    const indexRef: ShallowRef<number> = shallowRef(0);
    void indexRef;
    scope.run(() =>
        runAsForItem(() => {
            const row = itemRef.value;
            // The 4 bindings the compiled table row emits, each reading a reactive field
            // so track()/addDep runs (setProp data-id, setClass, setText id, setText label).
            renderEffect(() => {
                void row.id;
            });
            renderEffect(() => {
                void row.className;
            });
            renderEffect(() => {
                void row.id;
            });
            renderEffect(() => {
                void row.label;
            });
        })
    );
    return scope;
}

function mountAll(rowCount: number) {
    const { rows } = makeState(rowCount);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes: EffectScope[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
        scopes[i] = mountRow(rows[i]);
    }
    setCurrentOwner(prev);
    // Tear down so repeated bench iterations don't accumulate live effects.
    for (let i = 0; i < rowCount; i++) scopes[i].stop();
}

// Force a GC between iterations when available (`vitest --expose-gc` / node --expose-gc)
// to keep collection pauses OUT of the timed region — the create-10k @best op's ~6%
// cross-session drift is largely GC scheduling noise, which swamps a per-effect delta.
const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};

// Long, warmed-up runs so the per-effect setup delta rises above sample noise.
const OPTS = { time: 3000, warmupTime: 800, teardown } as const;

describe('for:each mount reactivity setup', () => {
    bench(
        'mount 1k rows (4 effects each = 4k effects)',
        () => {
            mountAll(1000);
        },
        OPTS
    );

    bench(
        'mount 10k rows (4 effects each = 40k effects)',
        () => {
            mountAll(10000);
        },
        OPTS
    );
});
