/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from '../types';
import { DocumentConstructor } from '../env/document';
import { defineProperty, isUndefined } from '../shared/language';
import patchNodePrototype from '../dom-patching/node';
import { reactWhenConnected, reactWhenDisconnected } from '../core/reactions';

/**
 * Path the DOM APIs and start monitoring dom mutations
 */
function patchDomApi(): void {
    patchNodePrototype();
}

const InitializationSlot = '$$node-reactions-initialized$$';
let reactWhenConnectedCached: (elm: Element, callback: ReactionCallback) => void;
let reactWhenDisconnectedCached: (elm: Element, callback: ReactionCallback) => void;

initialize();
/**
 * Set an internal field to detect initialization
 */
export function initialize(): void {
    let init = (DocumentConstructor as any)[InitializationSlot];
    if (isUndefined(init)) {
        patchDomApi();
        init = () => {
            return {
                connected: reactWhenConnected,
                disconnected: reactWhenDisconnected,
            };
        };
        // Defined as an arrow function to avoid anybody walking the prototype chain from
        // accidentally discovering the cached apis
        defineProperty(DocumentConstructor, InitializationSlot, { value: init });
    }
    const cachedApis = init();
    reactWhenConnectedCached = cachedApis.connected;
    reactWhenDisconnectedCached = cachedApis.disconnected;
}

export {
    reactWhenConnectedCached as reactWhenConnected,
    reactWhenDisconnectedCached as reactWhenDisconnected,
};
