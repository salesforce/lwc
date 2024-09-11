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
    keys,
    ArrayFilter,
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
        // Human-readable prop like `items[0].name` on a deep object/array
        const prop = isUndefined(parentKey)
            ? toString(key)
            : `${toString(parentKey)}.${toString(key)}`;
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
    if (isObject(target) && !isNull(target)) {
        // only track non-primitives; others are invalid as WeakMap keys
        targetsToPropertyKeys.set(target, key);

        // Deeply traverse arrays and objects to track every object within
        if (isArray(target)) {
            for (let i = 0; i < target.length; i++) {
                trackTargetForMutationLogging(`${toString(key)}[${i}]`, target[i]);
            }
        } else {
            for (const prop of keys(target)) {
                trackTargetForMutationLogging(`${toString(key)}.${prop}`, (target as any)[prop]);
            }
        }
    }
}
