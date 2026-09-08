/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): ATTRIBUTES the "select row" update cost. The
 * recorded lwc-vs-lwc-vapor krausest run shows select-row-1k at ~45ms vapor vs ~1.1ms
 * classic (40×) — a PURE UPDATE op (vapor's supposed strength) that is catastrophically
 * slow. Flipping one shared `component.selected` field re-runs all 1000 per-row
 * `className` effects that read it. 45ms / 1000 effects ≈ 45µs/effect — far too slow for
 * 998 memoized early-returns + 2 real class writes; smells like O(N) work PER effect.
 *
 * The perf harness compiles with process.env.NODE_ENV='production' (best.config.js:120),
 * so dev-only mutation logging + template-update hooks are DCE'd and are NOT the cause.
 * This bench runs the REAL createFor + real reactive component field, driving a
 * select-churn, to locate the production per-effect cost. We vary ROW COUNT (100 / 1000 /
 * 4000) to detect O(N²): if per-flip cost grows ~linearly with N (const µs/effect) it's
 * O(N) total = inherent fanout; if µs/effect GROWS with N it's O(N²) (a fixable
 * per-effect scan/alloc, e.g. trigger()'s `[...dep]` copy or a per-effect owner walk).
 *
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench select-attribution --run
 * Read min + throughput(hz) (GC-robust). ms/flip = 1000/hz / FLIPS; µs/effect = ms/flip
 * / ROWS * 1000. Compare µs/effect across the three sizes.
 */
import { bench, describe } from 'vitest';
import { template } from '../dom/template';
import { setText, setClass } from '../dom/prop';
import { child, nthChild } from '../dom/node';
import { renderEffect } from '../renderEffect';
import { createFor } from '../createFor';
import { insertBlock } from '../block';
import { shallowRef } from '../ref';
import { reactive } from '../reactivity';

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

// A table whose row className reads a SHARED reactive `selected` field — the krausest
// select-row shape. Every row subscribes to `component.selected`, so one flip notifies
// all N className effects.
function makeSelectTable(rows: Row[]) {
    const container = document.createElement('div');
    const component = reactive({ selected: -1 as number });
    const rowsRef = shallowRef<Row[]>([]);
    const frag = createFor(
        () => rowsRef.value,
        (row: any) => {
            const tr = rowTemplate() as HTMLElement;
            const idCell = child(tr);
            const labelCell = nthChild(tr, 1);
            renderEffect(() => setText(child(idCell) as Text, row.id));
            renderEffect(() => setText(child(labelCell) as Text, row.label));
            // className binding reading the SHARED selected field (the fanout dep).
            renderEffect(() => setClass(tr, component.selected === row.id ? 'danger' : ''));
            return tr;
        },
        (row: Row) => row.id
    );
    insertBlock(frag, container);
    rowsRef.value = rows;
    return { container, component };
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 500, teardown } as const;

const FLIPS = 50;

for (const N of [100, 1000, 4000] as const) {
    const rows = buildData(N);
    describe(`select-attribution: ${N} rows · ${FLIPS} flips`, () => {
        let table: ReturnType<typeof makeSelectTable>;
        let tick = 0;
        bench(
            `select-churn (${N})`,
            () => {
                for (let f = 0; f < FLIPS; f++) {
                    tick++;
                    // Flip to a distinct existing id each time so the write is a real
                    // change (fine-grained reactivity would no-op an unchanged write).
                    table.component.selected = (tick % N) + 1;
                }
            },
            {
                ...OPTS,
                setup() {
                    table = makeSelectTable(rows);
                    tick = 0;
                },
            }
        );
    });
}
