/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): ATTRIBUTES the clear-N cost of the REAL createFor
 * path. The recorded lwc-vs-lwc-vapor krausest run shows clear-10k at ~45ms vapor vs
 * ~0.38ms classic (117×) — the single largest op gap. A prior in-browser DOM bench
 * proved the DOM detach (per-row removeChild vs textContent='' vs Range) is
 * strategy-INVARIANT (~12ms, mostly deferred layout OFF the `script` metric), so the
 * `script` cost must be REACTIVITY TEARDOWN (10k× scope.stop() + reconcile bookkeeping),
 * NOT DOM removal.
 *
 * METHOD: vitest times the whole fn. The container is a DETACHED <div> (never in
 * document), so jsdom DOM removal on it is near-free — thus:
 *   clear teardown cost ≈ (create + clear) − (create only)
 * Comparing the 1k vs 10k delta checks for SUPERLINEAR (O(N²)) teardown scaling: a
 * linear teardown gives a 10× delta ratio; O(N²) gives ~100×.
 *
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench clear-attribution --run
 * Read min + throughput(hz) (GC-robust), NOT mean (GC-polluted). Convert hz→ms/op
 * as 1000/hz; clear-delta-ms = ms(create+clear) − ms(create only).
 */
import { bench, describe } from 'vitest';
import { template } from '../dom/template';
import { setText } from '../dom/prop';
import { child, nthChild } from '../dom/node';
import { renderEffect } from '../renderEffect';
import { createFor } from '../createFor';
import { insertBlock } from '../block';
import { shallowRef } from '../ref';

interface Row {
    id: number;
    label: string;
}

function buildData(count: number): Row[] {
    const data: Row[] = new Array(count);
    for (let i = 0; i < count; i++) {
        data[i] = { id: i + 1, label: `adjective colour noun ${i}` };
    }
    return data;
}

const rowTemplate = template('<tr><td>0</td><td>label</td></tr>');

function makeTable() {
    const container = document.createElement('div');
    const rowsRef = shallowRef<Row[]>([]);
    const frag = createFor(
        () => rowsRef.value,
        (row: any) => {
            const tr = rowTemplate() as HTMLElement;
            const idCell = child(tr);
            const labelCell = nthChild(tr, 1);
            renderEffect(() => setText(child(idCell) as Text, row.id));
            renderEffect(() => setText(child(labelCell) as Text, row.label));
            return tr;
        },
        (row: Row) => row.id
    );
    insertBlock(frag, container);
    return {
        container,
        set(rows: Row[]) {
            rowsRef.value = rows;
        },
    };
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 500, teardown } as const;

for (const N of [1000, 10000] as const) {
    // Pre-build the data ONCE per size so data allocation is out of the timed region
    // (both create-only and create+clear pay the SAME create cost; their delta is clear).
    const data = buildData(N);
    describe(`clear-attribution: ${N} rows`, () => {
        bench(
            `create only (${N})`,
            () => {
                const t = makeTable();
                t.set(data);
            },
            OPTS
        );
        bench(
            `create + clear (${N})`,
            () => {
                const t = makeTable();
                t.set(data);
                t.set([]);
            },
            OPTS
        );
    });
}
