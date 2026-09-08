/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Minimal reactive primitives used by control-flow helpers. `shallowRef` holds a
 * value whose reads are tracked and whose reassignments trigger dependents.
 */

import { track, trigger, createDep, type Dep } from './renderEffect';

export interface ShallowRef<T> {
    value: T;
}

export function shallowRef<T>(initial: T): ShallowRef<T> {
    const dep: Dep = createDep();
    let _value = initial;
    return {
        get value(): T {
            track(dep);
            return _value;
        },
        set value(next: T) {
            if (next !== _value) {
                _value = next;
                trigger(dep);
            }
        },
    };
}
