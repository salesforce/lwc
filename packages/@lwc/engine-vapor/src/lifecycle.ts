/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getCurrentInstance } from './component';

function createHook(key: 'bm' | 'm' | 'bu' | 'u' | 'dc') {
    return (fn: () => void): void => {
        const instance = getCurrentInstance();
        if (!instance) return;
        if (!instance[key]) {
            instance[key] = [];
        }
        instance[key]!.push(fn);
    };
}

export const onBeforeMount = createHook('bm');
export const onMounted = createHook('m');
export const onBeforeUpdate = createHook('bu');
export const onUpdated = createHook('u');
export const onDisconnected = createHook('dc');
