/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
//
// Do additional mutation tracking for DevTools performance profiling, in dev mode only.
//
import { ArrayPush, ArraySplice } from '@lwc/shared';
import { ReactiveObserver } from '../libs/mutation-tracker';
import { VM } from './vm';
import { assertNotProd } from './utils';

export interface MutationLog {
    vm: VM;
    key: PropertyKey;
}

const reactiveObserversToVMs = new WeakMap();

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
 * Log a new mutation
 * @param reactiveObserver - relevant ReactiveObserver
 * @param key - key (property) that was mutated
 */
export function logMutation(reactiveObserver: ReactiveObserver, key: PropertyKey) {
    assertNotProd();
    const vm = reactiveObserversToVMs.get(reactiveObserver);
    ArrayPush.call(mutationLogs, { vm, key });
}

/**
 * Flush logs associated with a given VM
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

// Keep a mapping of reactive observers to VMs which makes it simpler to track mutations
export function associateReactiveObserverWithVM(reactiveObserver: ReactiveObserver, vm: VM) {
    reactiveObserversToVMs.set(reactiveObserver, vm);
}
