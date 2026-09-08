/*
 * PEAK MEMORY ATTRIBUTION: measures each per-row allocation type individually
 * to isolate the actual memory cost of each component.
 *
 * Run: NODE_OPTIONS="--expose-gc" npx tsx packages/@lwc/engine-vapor/src/__tests__/peak-mem-attribution.ts
 */

import { renderEffect, runAsForItem, setCurrentOwner } from '../renderEffect';
import { reactive } from '../reactivity';
import { shallowRef, type ShallowRef } from '../ref';
import { EffectScope } from '../scope';

const REF = Symbol('itemRef');
const itemProxyHandler = {
    get(t: any, key: any) {
        const current = t[REF].value;
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
    return new Proxy({ [REF]: ref }, itemProxyHandler);
}

function makeState(rowCount: number) {
    const component = { selected: -1 };
    const rows: any[] = [];
    for (let i = 0; i < rowCount; i++) {
        rows.push({
            id: i + 1,
            label: 'adjective colour noun',
            get className() {
                return this.id === component.selected ? 'danger' : '';
            },
        });
    }
    const reactiveComponent = reactive(component);
    void reactiveComponent.selected;
    return { rows: reactive(rows), component: reactiveComponent };
}

function measureMem(fn: () => any): number {
    if (!global.gc) throw new Error('Run with NODE_OPTIONS="--expose-gc"');

    const runs = [];
    for (let i = 0; i < 5; i++) {
        global.gc();
        const before = process.memoryUsage().heapUsed;
        const retained = fn();
        global.gc();
        const after = process.memoryUsage().heapUsed;
        runs.push(after - before);

        // Cleanup
        if (Array.isArray(retained)) {
            for (const s of retained) {
                if (s && s.stop) s.stop();
            }
        }
        global.gc();
    }

    runs.sort((a, b) => a - b);
    return runs[2]; // median of 5
}

const COUNT = 10000;

console.log('=== Per-Allocation-Type Memory Attribution ===\n');

// 1. Just EffectScope
const scopeOnly = measureMem(() => {
    const scopes = [];
    for (let i = 0; i < COUNT; i++) {
        scopes.push(new EffectScope());
    }
    return scopes;
});
console.log(`1. EffectScope only (×${COUNT}):`);
console.log(`   Total: ${(scopeOnly / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Per-row: ${(scopeOnly / COUNT).toFixed(0)} bytes\n`);

// 2. EffectScope + 2 shallowRefs
const scopePlusRefs = measureMem(() => {
    const scopes = [];
    for (let i = 0; i < COUNT; i++) {
        const scope = new EffectScope();
        scope.run(() => {
            shallowRef(i);
            shallowRef(0);
        });
        scopes.push(scope);
    }
    return scopes;
});
console.log(`2. EffectScope + 2 shallowRefs (×${COUNT}):`);
console.log(`   Total: ${(scopePlusRefs / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Per-row: ${(scopePlusRefs / COUNT).toFixed(0)} bytes`);
console.log(
    `   Delta from (1): ${((scopePlusRefs - scopeOnly) / COUNT).toFixed(0)} bytes/ref-pair\n`
);

// 3. EffectScope + 2 refs + Proxy
const scopeRefsPlusProxy = measureMem(() => {
    const scopes = [];
    for (let i = 0; i < COUNT; i++) {
        const scope = new EffectScope();
        scope.run(() => {
            const itemRef = shallowRef({ id: i, label: 'test' });
            shallowRef(0);
            const proxy = itemProxy(itemRef);
            void proxy.id;
        });
        scopes.push(scope);
    }
    return scopes;
});
console.log(`3. EffectScope + 2 refs + Proxy (×${COUNT}):`);
console.log(`   Total: ${(scopeRefsPlusProxy / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Per-row: ${(scopeRefsPlusProxy / COUNT).toFixed(0)} bytes`);
console.log(
    `   Delta from (2): ${((scopeRefsPlusProxy - scopePlusRefs) / COUNT).toFixed(0)} bytes for Proxy\n`
);

// 4. EffectScope + 2 refs + Proxy + 1 effect
const plus1Effect = measureMem(() => {
    const { rows } = makeState(COUNT);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes = [];
    for (let i = 0; i < COUNT; i++) {
        const scope = new EffectScope();
        const itemRef = shallowRef(rows[i]);
        shallowRef(0);
        scope.run(() =>
            runAsForItem(() => {
                const row = itemProxy(itemRef);
                renderEffect(() => {
                    void row.id;
                    void row.className;
                });
            })
        );
        scopes.push(scope);
    }
    setCurrentOwner(prev);
    return scopes;
});
console.log(`4. Full setup + 1 ReactiveEffect (×${COUNT}):`);
console.log(`   Total: ${(plus1Effect / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Per-row: ${(plus1Effect / COUNT).toFixed(0)} bytes`);
console.log(
    `   Delta from (3): ${((plus1Effect - scopeRefsPlusProxy) / COUNT).toFixed(0)} bytes for 1 effect + tracking\n`
);

// 5. Full vapor shape: 3 effects
const plus3Effects = measureMem(() => {
    const { rows } = makeState(COUNT);
    const owner = {};
    const prev = setCurrentOwner(owner);
    const scopes = [];
    for (let i = 0; i < COUNT; i++) {
        const scope = new EffectScope();
        const itemRef = shallowRef(rows[i]);
        shallowRef(0);
        scope.run(() =>
            runAsForItem(() => {
                const row = itemProxy(itemRef);
                renderEffect(() => {
                    void row.id;
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
        scopes.push(scope);
    }
    setCurrentOwner(prev);
    return scopes;
});
console.log(`5. Full vapor shape: 3 ReactiveEffects (×${COUNT}):`);
console.log(`   Total: ${(plus3Effects / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Per-row: ${(plus3Effects / COUNT).toFixed(0)} bytes`);
console.log(
    `   Delta from (4): ${((plus3Effects - plus1Effect) / COUNT).toFixed(0)} bytes for 2 more effects\n`
);

console.log('=== BREAKDOWN ===');
console.log(`EffectScope base:              ${(scopeOnly / COUNT).toFixed(0)} bytes`);
console.log(
    `2 shallowRefs (item+index):    ${((scopePlusRefs - scopeOnly) / COUNT).toFixed(0)} bytes`
);
console.log(
    `Proxy (itemProxy):             ${((scopeRefsPlusProxy - scopePlusRefs) / COUNT).toFixed(0)} bytes`
);
console.log(
    `1 ReactiveEffect + dep links:  ${((plus1Effect - scopeRefsPlusProxy) / COUNT).toFixed(0)} bytes`
);
console.log(
    `2 more ReactiveEffects:        ${((plus3Effects - plus1Effect) / COUNT).toFixed(0)} bytes`
);
console.log(`TOTAL (3 effects):             ${(plus3Effects / COUNT).toFixed(0)} bytes/row\n`);

const perEffect = (plus3Effects - plus1Effect) / COUNT / 2;
console.log(`=== COST PER REACTIVEEFFECT ===`);
console.log(
    `First effect (incl. dep setup): ${((plus1Effect - scopeRefsPlusProxy) / COUNT).toFixed(0)} bytes`
);
console.log(`Additional effects (marginal):  ${perEffect.toFixed(0)} bytes each\n`);

console.log('=== TOP MEMORY LEVERS (by size) ===');
const effects3Cost =
    (plus3Effects - plus1Effect) / COUNT + (plus1Effect - scopeRefsPlusProxy) / COUNT;
const refsCost = (scopePlusRefs - scopeOnly) / COUNT;
const proxyCost = (scopeRefsPlusProxy - scopePlusRefs) / COUNT;

const levers = [
    {
        name: 'ReactiveEffect objects (3×)',
        bytes: effects3Cost,
        pct: (effects3Cost / (plus3Effects / COUNT)) * 100,
    },
    { name: 'ShallowRefs (2×)', bytes: refsCost, pct: (refsCost / (plus3Effects / COUNT)) * 100 },
    {
        name: 'Proxy (itemProxy)',
        bytes: proxyCost,
        pct: (proxyCost / (plus3Effects / COUNT)) * 100,
    },
];
levers.sort((a, b) => b.bytes - a.bytes);

for (let i = 0; i < levers.length; i++) {
    const l = levers[i];
    console.log(
        `${i + 1}. ${l.name.padEnd(30)} ${l.bytes.toFixed(0).padStart(5)} bytes (${l.pct.toFixed(1)}%)`
    );
}

console.log('\n=== RECOMMENDATION ===');
console.log('Reducing ReactiveEffect count (3→2 or 3→1) would save:');
console.log(
    `  - 3→2: ~${perEffect.toFixed(0)} bytes/row (~${((perEffect / (plus3Effects / COUNT)) * 100).toFixed(1)}%)`
);
console.log(
    `  - 3→1: ~${(perEffect * 2).toFixed(0)} bytes/row (~${(((perEffect * 2) / (plus3Effects / COUNT)) * 100).toFixed(1)}%)`
);
console.log('  BUT: effect-fold A/B was perf-flat (rejected)');
console.log('');
console.log('Eliminating itemProxy would save:');
console.log(
    `  - ~${proxyCost.toFixed(0)} bytes/row (~${((proxyCost / (plus3Effects / COUNT)) * 100).toFixed(1)}%)`
);
console.log('  - Requires compiler change (emit ref.value instead of proxy)');
console.log('  - Perf impact: ~2.5% faster (small but stackable)');
