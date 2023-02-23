/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined } from '@lwc/shared';

const supportsWeakRefs =
    typeof WeakRef === 'function' && typeof FinalizationRegistry === 'function';

// A map where the keys are weakly held and the values are a Set that are also each weakly held.
// The goal is to avoid leaking the Values, which is what would happen with a WeakMap<T, Set<V>>.
export interface WeakMultiMap<T extends object, V extends object> {
    get(key: T): ReadonlySet<V>;
    add(key: T, vm: V): void;
    clear(key: T): void;
}

// In browsers that doesn't support WeakRefs, the values will still leak, but at least the keys won't
class LegacyWeakMultiMap<K extends object, V extends object> implements WeakMultiMap<K, V> {
    private _map: WeakMap<K, Set<V>> = new WeakMap();

    private _getValues(key: K): Set<V> {
        let values = this._map.get(key);
        if (isUndefined(values)) {
            values = new Set();
            this._map.set(key, values);
        }
        return values;
    }

    get(key: K): ReadonlySet<V> {
        return this._getValues(key);
    }
    add(key: K, vm: V) {
        const set = this._getValues(key);
        set.add(vm);
    }
    clear(key: K) {
        this._map.delete(key);
    }
}

// This implementation relies on the WeakRef/FinalizationRegistry proposal.
// For some background, see: https://github.com/tc39/proposal-weakrefs
class ModernWeakMultiMap<K extends object, V extends object> implements WeakMultiMap<K, V> {
    private _map = new WeakMap<K, WeakRef<V>[]>();

    private _registry = new FinalizationRegistry((heldValue: K) => {
        // This should be considered an optional cleanup method to remove GC'ed values from their respective arrays.
        // JS VMs are not obligated to call FinalizationRegistry callbacks.
        const weakRefs = this._getWeakRefs(heldValue);

        // Work backwards, removing stale VMs
        for (let i = weakRefs.length - 1; i >= 0; i--) {
            const vm = weakRefs[i].deref();
            if (isUndefined(vm)) {
                weakRefs.splice(i, 1); // remove
            }
        }
    });

    private _getWeakRefs(key: K): WeakRef<V>[] {
        let weakRefs = this._map.get(key);
        if (isUndefined(weakRefs)) {
            weakRefs = [];
            this._map.set(key, weakRefs);
        }
        return weakRefs;
    }

    get(key: K): ReadonlySet<V> {
        const weakRefs = this._getWeakRefs(key);
        const result = new Set<V>();
        for (const weakRef of weakRefs) {
            const vm = weakRef.deref();
            if (!isUndefined(vm)) {
                result.add(vm);
            }
        }
        return result;
    }
    add(key: K, value: V) {
        const weakRefs = this._getWeakRefs(key);
        // We could check for duplicate values here, but it doesn't seem worth it.
        // We transform the output into a Set anyway
        weakRefs.push(new WeakRef<V>(value));
        this._registry.register(value, key);
    }
    clear(key: K) {
        this._map.delete(key);
    }
}

export const WeakMultiMap = supportsWeakRefs ? ModernWeakMultiMap : LegacyWeakMultiMap;
