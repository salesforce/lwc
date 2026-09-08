/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { bench, describe } from 'vitest';
import { ReactiveEffect } from '../renderEffect';

// Isolates the per-effect COST of renderEffect()'s `wrapped` closure: on the mount
// first-run the wrapper is a pure pass-through (hook branches are `!firstRun`-gated),
// so its only mount cost is (a) allocating a closure that CAPTURES 3 vars (effect,
// coOwner, firstRun) → a V8 Context alloc, and (b) the `effect.fn = wrapped` property
// write. This runs ×3-4 per krausest row (12k-16k times for create-1k, 120k-160k for
// create-10k). Question: is that closure+swap a measurable fraction of per-effect setup,
// or is it in the proven sub-noise per-alloc class?
//
// PATH A (CURRENT renderEffect): new ReactiveEffect + allocate wrapped closure capturing
//   3 vars + swap effect.fn + run.
// PATH B (REFACTORED — hooks folded into run()): new ReactiveEffect + run. No closure, no
//   swap. Semantics preserved by run() reading `this.ran` internally (not simulated here;
//   this bench measures ONLY the alloc+swap delta the refactor removes).

const ROWS_1K = 1000;
const EFFECTS_PER_ROW = 4; // krausest row: setProp + setClass + setText(id) + setText(label)
const N = ROWS_1K * EFFECTS_PER_ROW; // 4000 effects = create-1k

// A trivial effect body (no dep reads) so we isolate the wrapper cost, not tracking.
function makeBody(): () => void {
    return () => {
        // no-op
    };
}

describe('renderEffect wrapper-closure cost (create-1k = 4000 effects)', () => {
    bench('PATH A: new ReactiveEffect + wrapped-closure + fn-swap + run', () => {
        for (let i = 0; i < N; i++) {
            const fn = makeBody();
            const effect = new ReactiveEffect(fn);
            // Reproduce renderEffect's wrapper: captures effect, coOwner, firstRun.
            const coOwner: object | null = null;
            let firstRun = true;
            const wrapped = () => {
                // Mount first-run path: pure pass-through (hooks are null/gated).
                fn();
                if (!firstRun && coOwner) {
                    // never taken on mount
                }
                firstRun = false;
            };
            (effect as unknown as { fn: () => void }).fn = wrapped;
            effect.run();
        }
    });

    bench('PATH B: new ReactiveEffect + run (no closure, no swap)', () => {
        for (let i = 0; i < N; i++) {
            const fn = makeBody();
            const effect = new ReactiveEffect(fn);
            effect.run();
        }
    });
});
