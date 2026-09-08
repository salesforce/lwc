/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): isolates the per-row MOUNT saving from the
 * `setClass(el, '')` empty-string fast path. In the krausest create ops no row is
 * selected, so the row `className` getter returns '' for EVERY row. The full setClass
 * path allocates a `new Set<string>()` + runs the tokenizer regex/split per row purely
 * to produce an empty token set (real work — a Set is a hash-table alloc, and split()
 * allocates an array + runs a regex — paid 10k times at create-10k). The empty fast
 * path short-circuits before any of that.
 *
 * METHOD: A/B in ONE process on fresh detached <div> elements. BEFORE calls the current
 * full tokenize path (a local copy, since the committed setClass now fast-paths ''),
 * AFTER calls the real setClass with ''. Both start from a virgin element ($clsTokens
 * undefined) — the krausest first-mount state.
 *
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench set-class-empty --run
 * Read min + throughput(hz) (GC-robust), NOT mean (GC-polluted).
 */
import { bench, describe } from 'vitest';
import { setClass } from '../dom/prop';

const ROWS = 10000;

// The OLD full-path behaviour for value === '' (what setClass did before the fast path):
// allocate a token Set, tokenize via split, diff against prev (none on first mount), set.
function setClassFullPathEmpty(el: Element): void {
    const castEl = el as any;
    const next = new Set<string>();
    for (const tok of ''.split(/\s+/)) {
        if (tok) next.add(tok);
    }
    const prev = castEl.$clsTokens;
    if (prev) {
        for (const tok of prev) {
            if (!next.has(tok)) el.classList.remove(tok);
        }
    }
    for (const tok of next) el.classList.add(tok);
    castEl.$clsTokens = next;
}

function makeRows(): Element[] {
    const rows: Element[] = new Array(ROWS);
    for (let i = 0; i < ROWS; i++) {
        rows[i] = document.createElement('tr');
    }
    return rows;
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 500, teardown } as const;

describe(`setClass('') mount saving — ${ROWS} rows`, () => {
    let rows: Element[];
    bench(
        'BEFORE: full tokenize path (Set + regex split per row)',
        () => {
            for (let i = 0; i < ROWS; i++) setClassFullPathEmpty(rows[i]);
        },
        { ...OPTS, setup: () => (rows = makeRows()) }
    );
    bench(
        'AFTER: empty-string fast path',
        () => {
            for (let i = 0; i < ROWS; i++) setClass(rows[i], '');
        },
        { ...OPTS, setup: () => (rows = makeRows()) }
    );
});
