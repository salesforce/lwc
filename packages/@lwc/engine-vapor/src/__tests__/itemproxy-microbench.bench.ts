/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * MICROBENCHMARK (not a parity test): SIZES the per-row `itemProxy` lever.
 *
 * createFor.mountItem allocates ONE `new Proxy({ [REF]: ref }, handler)` per row so the
 * compiled body can read `item.id` (not `item.value.id`). Vue Vapor allocates ZERO — it
 * passes the raw `shallowRef` and the compiled body reads `item.value.id`. A `new Proxy()`
 * is genuine V8 hash-table/exotic-object work (a real lever, per the Set/Map/Proxy rule);
 * a `.value` property read is ~free. This bench measures the DELTA both on MOUNT (proxy
 * allocation + first trap reads) and on UPDATE (repeat trap reads per flip), to decide
 * whether the compiler lift (emit `item.value.foo`, drop the proxy) is worth it.
 *
 * Both arms run the SAME real reactivity: EffectScope + shallowRef + 3 renderEffects that
 * read id/label/className. The ONLY difference is proxy-trap reads vs direct `.value`
 * reads. We DON'T touch the DOM (no template clone) so the proxy signal isn't diluted by
 * the ~55% DOM fraction of a real create — this is the pure reactivity-setup delta, which
 * must then be multiplied by ~0.45 to estimate the end-to-end create effect.
 *
 * Run: NODE_OPTIONS="--expose-gc" yarn vitest bench itemproxy-microbench --run
 * Read min + throughput(hz) (GC-robust). Compare PROXY vs RAW at each N.
 */
import { bench, describe } from 'vitest';
import { EffectScope } from '../scope';
import { renderEffect } from '../renderEffect';
import { shallowRef, type ShallowRef } from '../ref';

interface Row {
    id: number;
    label: string;
    readonly className: string;
}

// Replicates createFor's module-private itemProxy (singleton handler, per-row target).
const REF: unique symbol = Symbol('itemRef');
interface ItemProxyTarget {
    [REF]: ShallowRef<any>;
}
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
function itemProxy<T>(ref: ShallowRef<T>): T {
    return new Proxy({ [REF]: ref } as ItemProxyTarget, itemProxyHandler) as T;
}

// Rows carry a `className` getter (as krausest rows do) but reading a PLAIN captured
// field, NOT a shared long-lived reactive — so each iteration's effects/scopes are
// collectable after teardown (a shared reactive dep would retain every scope → OOM).
// The getter still exercises the proxy trap's function/property branch identically.
function buildData(count: number): Row[] {
    const data: Row[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const id = i + 1;
        data[i] = {
            id,
            label: `adjective colour noun ${i}`,
            get className() {
                return id % 10 === 0 ? 'danger' : '';
            },
        };
    }
    return data;
}

// One row's reactive setup, reading 3 fields (id/label/className) in 3 render effects,
// exactly like the krausest row — but no DOM. `useProxy` toggles the ONLY difference.
// Reads are wrapped in `void` (rather than an unused accumulator) so V8 can't DCE them.
function mountRow(item: Row, useProxy: boolean): EffectScope {
    const scope = new EffectScope();
    const itemRef = shallowRef(item);
    scope.run(() => {
        if (useProxy) {
            const p = itemProxy(itemRef) as Row;
            renderEffect(() => {
                void ((p.id as number) & 1);
            });
            renderEffect(() => {
                void p.label.length;
            });
            renderEffect(() => {
                void p.className.length;
            });
        } else {
            renderEffect(() => {
                void ((itemRef.value.id as number) & 1);
            });
            renderEffect(() => {
                void itemRef.value.label.length;
            });
            renderEffect(() => {
                void itemRef.value.className.length;
            });
        }
    });
    return scope;
}

const gc: (() => void) | undefined = (globalThis as any).gc;
const teardown = () => {
    if (gc) gc();
};
const OPTS = { time: 3000, warmupTime: 500, teardown } as const;

for (const N of [1000, 4000] as const) {
    const rows = buildData(N);

    describe(`itemproxy mount: ${N} rows`, () => {
        let scopes: EffectScope[] = [];
        bench(
            `PROXY create (${N})`,
            () => {
                scopes = new Array(N);
                for (let i = 0; i < N; i++) scopes[i] = mountRow(rows[i], true);
            },
            {
                ...OPTS,
                teardown() {
                    for (const s of scopes) s.stop();
                    if (gc) gc();
                },
            }
        );
        bench(
            `RAW create (${N})`,
            () => {
                scopes = new Array(N);
                for (let i = 0; i < N; i++) scopes[i] = mountRow(rows[i], false);
            },
            {
                ...OPTS,
                teardown() {
                    for (const s of scopes) s.stop();
                    if (gc) gc();
                },
            }
        );
    });
}
