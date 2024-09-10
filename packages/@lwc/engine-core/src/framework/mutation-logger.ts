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
    ArraySplice,
    isUndefined,
    toString,
    isObject,
    isNull,
    isArray,
    keys,
} from '@lwc/shared';
import { ReactiveObserver } from '../libs/mutation-tracker';
import { VM } from './vm';
import { assertNotProd } from './utils';

export interface MutationLog {
    vm: VM;
    prop: string;
}

const reactiveObserversToVMs = new WeakMap<ReactiveObserver, VM>();
const trackedTargetsToPropertyKeys = new WeakMap<object, PropertyKey>();
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
    const parentKey = trackedTargetsToPropertyKeys.get(target);
    const vm = reactiveObserversToVMs.get(reactiveObserver);
    if (isUndefined(vm)) {
        throw new Error('vm must be defined');
    }
    const displayKey = isUndefined(parentKey)
        ? toString(key)
        : `${toString(parentKey)}.${toString(key)}`;
    ArrayPush.call(mutationLogs, { vm, prop: displayKey });
}

/**
 * Flush logs associated with a given VM.
 * @param vm - given VM
 */
export function flushMutationLogsForVM(vm: VM) {
    assertNotProd();
    for (let i = mutationLogs.length - 1; i >= 0; i--) {
        if (mutationLogs[i].vm === vm) {
            ArraySplice.call(mutationLogs, i, 1);
        }
    }
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
export function trackTargetForMutationLogging(key: PropertyKey, target: object) {
    assertNotProd();
    if (isObject(target) && !isNull(target)) {
        // only track non-primitives; others are invalid as WeakMap keys
        trackedTargetsToPropertyKeys.set(target, key);

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
