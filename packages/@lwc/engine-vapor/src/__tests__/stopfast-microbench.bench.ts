/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { bench, describe } from 'vitest';

// TEARDOWN-ONLY lever: during full stop() the effect is discarded and its deps/depsTail
// are nulled at the end — so the TWO effect-side pointer writes per edge (splicing the
// Link out of the effect's OWN dep-list) are PURE WASTE. Only the TWO dep-side writes
// (splicing out of the surviving dep's subscriber-list, e.g. the shared `selected` dep)
// are needed. This models krausest clear-1k: 1000 rows × 3 effects, edges split between
// per-row deps (die with the row) and ONE shared dep with 1000 subscribers (survives).
//
// FULL: current unlink() — 4 pointer writes/edge.
// FAST: dep-side-only unlink — 2 pointer writes/edge (skip effect-side).
// This is a DESTRUCTION-path lever: it CANNOT erode the 4 update wins (those are re-run,
// not teardown). The only question is whether halving splice-writes clears the noise floor.

interface Link {
    dep: Dep;
    sub: Effect;
    prevDep: Link | undefined;
    nextDep: Link | undefined;
    prevSub: Link | undefined;
    nextSub: Link | undefined;
}
interface Dep {
    subs: Link | undefined;
    subsTail: Link | undefined;
}
class Effect {
    deps: Link | undefined = undefined;
    depsTail: Link | undefined = undefined;
    stopped = false;
    addDep(dep: Dep): void {
        const link: Link = {
            dep,
            sub: this,
            prevDep: this.depsTail,
            nextDep: undefined,
            prevSub: dep.subsTail,
            nextSub: undefined,
        };
        if (this.depsTail) this.depsTail.nextDep = link;
        else this.deps = link;
        this.depsTail = link;
        if (dep.subsTail) dep.subsTail.nextSub = link;
        else dep.subs = link;
        dep.subsTail = link;
    }
    // CURRENT: full 4-write unlink per edge.
    stopFull(): void {
        this.stopped = true;
        let link = this.deps;
        while (link !== undefined) {
            const { dep, prevDep, nextDep, prevSub, nextSub } = link;
            // effect-side splice (WASTED — deps nulled below)
            if (nextDep !== undefined) nextDep.prevDep = prevDep;
            else this.depsTail = prevDep;
            if (prevDep !== undefined) prevDep.nextDep = nextDep;
            else this.deps = nextDep;
            // dep-side splice (NEEDED)
            if (nextSub !== undefined) nextSub.prevSub = prevSub;
            else dep.subsTail = prevSub;
            if (prevSub !== undefined) prevSub.nextSub = nextSub;
            else dep.subs = nextSub;
            link = nextDep;
        }
        this.deps = undefined;
        this.depsTail = undefined;
    }
    // FAST: dep-side-only 2-write unlink per edge (walk via captured nextDep).
    stopFast(): void {
        this.stopped = true;
        let link = this.deps;
        while (link !== undefined) {
            const { dep, nextDep, prevSub, nextSub } = link;
            if (nextSub !== undefined) nextSub.prevSub = prevSub;
            else dep.subsTail = prevSub;
            if (prevSub !== undefined) prevSub.nextSub = nextSub;
            else dep.subs = nextSub;
            link = nextDep;
        }
        this.deps = undefined;
        this.depsTail = undefined;
    }
}

// Build the krausest clear scenario: N rows, each with 3 effects.
// E1 reads row.id (per-row dep) + selected (SHARED dep, N subs).
// E2 reads row.id. E3 reads row.label. itemRef read too. ~5 edges/row avg.
function build(N: number) {
    const shared: Dep = { subs: undefined, subsTail: undefined };
    const effects: Effect[] = [];
    for (let i = 0; i < N; i++) {
        const rowId: Dep = { subs: undefined, subsTail: undefined };
        const rowLabel: Dep = { subs: undefined, subsTail: undefined };
        const e1 = new Effect();
        e1.addDep(rowId);
        e1.addDep(shared); // subscribes to the ONE shared selected dep
        const e2 = new Effect();
        e2.addDep(rowId);
        const e3 = new Effect();
        e3.addDep(rowLabel);
        effects.push(e1, e2, e3);
    }
    return effects;
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const OPTS = { time: 2000, warmupTime: 300, teardown: () => gc?.() } as const;

describe('stopFast teardown lever (clear-1k = 1000 rows × 3 effects)', () => {
    bench(
        'FULL unlink (4 writes/edge) — current',
        () => {
            const effects = build(1000);
            for (const e of effects) e.stopFull();
        },
        OPTS
    );

    bench(
        'FAST unlink (2 writes/edge) — dep-side only',
        () => {
            const effects = build(1000);
            for (const e of effects) e.stopFast();
        },
        OPTS
    );
});
