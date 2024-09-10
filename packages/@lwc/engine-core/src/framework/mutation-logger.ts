/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Do additional mutation tracking for DevTools performance profiling, in dev mode only.

import { VM } from './vm';
import { assertNotProd } from './utils';

export interface MutationLog {
    vm: VM;
    key: PropertyKey;
}

const mutationLogs: MutationLog[] = [];

/**
 * Flush all the logs we've written so far and return the current logs.
 */
export function getAndFlushMutationLogs() {
    assertNotProd();
    const result = [...mutationLogs];
    mutationLogs.length = 0; // clear
    return result;
}

/**
 * Log a new mutation
 * @param vm - relevant VM whose property was mutated
 * @param key - key (property) that was mutated
 */
export function logMutation(vm: VM, key: PropertyKey) {
    assertNotProd();
    mutationLogs.push({ vm, key });
}
