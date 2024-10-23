/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
//
// Do additional mutation tracking for DevTools performance profiling, in dev mode only.
//
import {
    ArrayPush,
    isUndefined,
    toString,
    isObject,
    isNull,
    isArray,
    ArrayFilter,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    isString,
} from '@lwc/shared';
import { ReactiveObserver } from '../libs/mutation-tracker';
import { VM } from './vm';
import { assertNotProd } from './utils';

export interface MutationLog {
    vm: VM;
    prop: string;
}

const reactiveObserversToVMs = new WeakMap<ReactiveObserver, VM>();
const targetsToPropertyKeys = new WeakMap<object, PropertyKey>();
let mutationLogs: MutationLog[] = [];

// Create a human-readable member access notation like `obj.foo` or `arr[1]`,
// handling edge cases like `obj[Symbol("bar")]` and `obj["spaces here"]`
function toPrettyMemberNotation(parent: PropertyKey | undefined, child: PropertyKey) {
    if (isUndefined(parent)) {
        // Bare prop, just stringify the child
        return toString(child);
    } else if (!isString(child)) {
        // Symbol/number, e.g. `obj[Symbol("foo")]` or `obj[1234]`
        return `${toString(parent)}[${toString(child)}]`;
    } else if (/^\w+$/.test(child)) {
        // Dot-notation-safe string, e.g. `obj.foo`
        return `${toString(parent)}.${child}`;
    } else {
        // Bracket-notation-requiring string, e.g. `obj["prop with spaces"]`
        return `${toString(parent)}[${JSON.stringify(child)}]`;
    }
}

function safelyCallGetter(target: any, key: PropertyKey) {
    // Arbitrary getters can throw. We don't want to throw an error just due to dev-mode-only mutation tracking
    // (which is only used for performance debugging) so ignore errors here.
    try {
        return target[key];
    } catch (_err) {
        /* ignore */
    }
}

/**
 * Flush all the logs we've written so far and return the current logs.
 */
export function getAndFlushMutationLogs() {
    assertNotProd();
    const result = mutationLogs;
    mutationLogs = [];
    return result;
}

/**
 * Log a new mutation for this reactive observer.
 * @param reactiveObserver - relevant ReactiveObserver
 * @param target - target object that is being observed
 * @param key - key (property) that was mutated
 */
export function logMutation(reactiveObserver: ReactiveObserver, target: object, key: PropertyKey) {
    assertNotProd();
    const parentKey = targetsToPropertyKeys.get(target);
    const vm = reactiveObserversToVMs.get(reactiveObserver);

    /* istanbul ignore if */
    if (isUndefined(vm)) {
        // VM should only be undefined in Vitest tests, where a reactive observer is not always associated with a VM
        // because the unit tests just create Reactive Observers on-the-fly.
        // Note we could explicitly target Vitest with `process.env.NODE_ENV === 'test'`, but then that would also
        // affect our downstream consumers' Jest/Vitest tests, and we don't want to throw an error just for a logger.
        if (process.env.NODE_ENV === 'test-karma-lwc') {
            throw new Error('The VM should always be defined except possibly in unit tests');
        }
    } else {
        const prop = toPrettyMemberNotation(parentKey, key);
        ArrayPush.call(mutationLogs, { vm, prop });
    }
}

/**
 * Flush logs associated with a given VM.
 * @param vm - given VM
 */
export function flushMutationLogsForVM(vm: VM) {
    assertNotProd();
    mutationLogs = ArrayFilter.call(mutationLogs, (log) => log.vm !== vm);
}

/**
 * Mark this ReactiveObserver as related to this VM. This is only needed for mutation tracking in dev mode.
 * @param reactiveObserver
 * @param vm
 */
export function associateReactiveObserverWithVM(reactiveObserver: ReactiveObserver, vm: VM) {
    assertNotProd();
    reactiveObserversToVMs.set(reactiveObserver, vm);
}

/**
 * Deeply track all objects in a target and associate with a given key.
 * @param key - key associated with the object in the component
 * @param target - tracked target object
 */
export function trackTargetForMutationLogging(key: PropertyKey, target: any) {
    assertNotProd();
    if (targetsToPropertyKeys.has(target)) {
        // Guard against recursive objects - don't traverse forever
        return;
    }
    if (isObject(target) && !isNull(target)) {
        // only track non-primitives; others are invalid as WeakMap keys
        targetsToPropertyKeys.set(target, key);

        // Deeply traverse arrays and objects to track every object within
        if (isArray(target)) {
            for (let i = 0; i < target.length; i++) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, i),
                    safelyCallGetter(target, i)
                );
            }
        } else {
            // Track only own property names and symbols (including non-enumerated)
            // This is consistent with what observable-membrane does:
            // https://github.com/salesforce/observable-membrane/blob/b85417f/src/base-handler.ts#L142-L143
            // Note this code path is very hot, hence doing two separate for-loops rather than creating a new array.
            for (const prop of getOwnPropertyNames(target)) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, prop),
                    safelyCallGetter(target, prop)
                );
            }
            for (const prop of getOwnPropertySymbols(target)) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, prop),
                    safelyCallGetter(target, prop)
                );
            }
        }
    }
}
