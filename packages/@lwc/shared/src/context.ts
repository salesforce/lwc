/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';

export type ContextKeys = {
    connectContext: symbol;
    disconnectContext: symbol;
    contextEventKey: symbol;
};

let contextKeys: ContextKeys;

export function setContextKeys(config: ContextKeys) {
    isFalse(contextKeys, '`setContextKeys` cannot be called more than once');

    contextKeys = config;
}

export function getContextKeys() {
    return contextKeys;
}

export const ContextEventName = 'lightning:context-request';
