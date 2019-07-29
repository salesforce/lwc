/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import reactTo from './index';
import { DocumentPrototype } from './env/document';
import { defineProperty, create, isUndefined } from './shared/language';
import patchNodePrototye from './dom-patching/node';

/**
 * Path the DOM APIs and start monitoring dom mutations
 */
function patchDom(): void {
    patchNodePrototye();
}

const InitializationSlot = '$$node-reactions-initialized$$';
/**
 * Set an internal field to detect initialization
 */
export function initialize_option1(): void {
    if (!isUndefined((document as any)[InitializationSlot])) {
        return;
    }
    patchDom();
    defineProperty(DocumentPrototype, InitializationSlot, { value: true });
}

/**
 * Initialize the library globally and make it available on window
 */
export function initialize_option2(): void {
    if (!isUndefined((window as any)['node-reactions'])) {
        return;
    }
    patchDom();
    (window as any)['node-reactions'] = create(null, {
        reactTo: {
            value: reactTo,
            enumerable: true,
        },
    });
}
