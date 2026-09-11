/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): isolates the per-row MOUNT saving from the
 * "lazy indexRef" lever. A for:each row whose body never reads the iteration index
 * (the krausest shape — compiler emits an arity-1 render callback) does not need a
 * per-row `shallowRef(index)`. `shallowRef` eagerly allocates a `Dep` Set (real
 * hash-table work, unlike a plain object which V8's bump allocator makes ~free), so
 * skipping it removes one object + one Set per row.
 *
 * METHOD: A/B in ONE process, controlled. Both arms build N rows with the SAME
 * itemRef + effects; the only difference is whether each row also allocates a real
 * `shallowRef(index)` (BEFORE) or reuses a shared no-op sentinel (AFTER). Delta =
 * the indexRef allocation cost. This directly measures the lever mechanism, which the
 * @best create-1k median (2-4% MAD) is too noisy to resolve.
 *
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench index-ref-mount --run
 * Read min + throughput(hz) (GC-robust), NOT mean (GC-polluted).
 */
import { bench, describe } from 'vitest';
import { shallowRef, type ShallowRef } from '../ref';

const NOOP_INDEX_REF: ShallowRef<number> = {
    get value() {
        return -1;
    },
    set value(_next: number) {
        /* no-op */
    },
};

const ROWS = 10000;

// Mimic mountItem's per-row ref allocation: every row always allocates an itemRef
// (shallowRef) — that is unavoidable. The lever is ONLY about the index ref.
function buildRows(withRealIndexRef: boolean): ShallowRef<any>[] {
    const refs: ShallowRef<any>[] = new Array(ROWS);
    for (let i = 0; i < ROWS; i++) {
        const itemRef = shallowRef({ id: i + 1, label: 'adjective colour noun' });
        const indexRef = withRealIndexRef ? shallowRef(i) : NOOP_INDEX_REF;
        // Keep both live so neither is DCE'd; store the itemRef (both arms store one ref).
        void indexRef.value;
        refs[i] = itemRef;
    }
    return refs;
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 500, teardown } as const;

describe(`lazy-indexRef mount saving — ${ROWS} rows`, () => {
    bench(
        'BEFORE: real shallowRef(index) per row',
        () => {
            buildRows(true);
        },
        OPTS
    );
    bench(
        'AFTER: shared no-op sentinel indexRef',
        () => {
            buildRows(false);
        },
        OPTS
    );
});
