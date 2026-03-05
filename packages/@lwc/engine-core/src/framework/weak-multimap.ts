/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArrayPush, ArraySplice, isUndefined } from '@lwc/shared';

/**
 * A map where the keys are weakly held and the values are a Set that are also each weakly held.
 * The goal is to avoid leaking the values, which is what would happen with a WeakMap<K, Set<V>>.
 *
 * Note that this is currently only intended to be used in dev/PRODDEBUG environments.
 * It leaks in legacy browsers, which may be undesired.
 *
 * This implementation relies on the WeakRef/FinalizationRegistry proposal.
 * For some background, see: https://github.com/tc39/proposal-weakrefs
 */
export class WeakMultimap<K extends object, V extends object> {
    private _map = new WeakMap<K, WeakRef<V>[]>();

    private _registry = new FinalizationRegistry((weakRefs: WeakRef<V>[]) => {
        // This should be considered an optional cleanup method to remove GC'ed values from their respective arrays.
        // JS VMs are not obligated to call FinalizationRegistry callbacks.

        // Work backwards, removing stale VMs
        for (let i = weakRefs.length - 1; i >= 0; i--) {
            const vm = weakRefs[i].deref();
            if (isUndefined(vm)) {
                ArraySplice.call(weakRefs, i, 1); // remove
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
        // Skip adding if already present
        for (const weakRef of weakRefs) {
            if (weakRef.deref() === value) {
                return;
            }
        }
        ArrayPush.call(weakRefs, new WeakRef<V>(value));

        // It's important here not to leak the second argument, which is the "held value." The FinalizationRegistry
        // effectively creates a strong reference between the first argument (the "target") and the held value. When
        // the target is GC'ed, the callback is called, and then the held value is GC'ed.
        // Putting the key here would mean the key is not GC'ed until the value is GC'ed, which defeats the purpose
        // of the WeakMap. Whereas putting the weakRefs array here is fine, because it doesn't have a strong reference
        // to anything. See also this example:
        // https://gist.github.com/nolanlawson/79a3d36e8e6cc25c5048bb17c1795aea
        this._registry.register(value, weakRefs);
    }
    delete(key: K) {
        this._map.delete(key);
    }
}
