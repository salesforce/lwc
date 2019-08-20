/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback } from '../types';
import { DocumentConstructor } from '../env/document';
import { defineProperty, create, isUndefined } from '../shared/language';
import { createFieldName } from '../shared/fields';
import patchNodePrototype from '../dom-patching/node';
import { reactWhenConnected, reactWhenDisconnected } from '../core/reactions';

/**
 * Path the DOM APIs and start monitoring dom mutations
 */
function patchDomApi(): void {
    patchNodePrototype();
}

const InitializationSlot = '$$node-reactions-initialized$$';
let NodeToReactionsLookup: symbol;
let reactWhenConnectedCached: (elm: Element, callback: ReactionCallback) => void;
let reactWhenDisconnectedCached: (elm: Element, callback: ReactionCallback) => void;

/**
 * Set an internal field to detect initialization
 */
export function initialize(): void {
    if (!isUndefined((DocumentConstructor as any)[InitializationSlot])) {
        const cached = (DocumentConstructor as any)[InitializationSlot]();
        reactWhenConnectedCached = cached[ReactionEventType.connected];
        reactWhenDisconnectedCached = cached[ReactionEventType.disconnected];
        NodeToReactionsLookup = cached['NodeToReactionsLookup'];
        return;
    }
    patchDomApi();
    const init = create(null);
    reactWhenConnectedCached = init[ReactionEventType.connected] = reactWhenConnected;
    reactWhenDisconnectedCached = init[ReactionEventType.disconnected] = reactWhenDisconnected;
    NodeToReactionsLookup = init['NodeToReactionsLookup'] = createFieldName('callback-lookup');
    // Defined as an arrow function to avoid anybody walking the prototype chain from
    // accidentally discovering the cached apis
    defineProperty(DocumentConstructor, InitializationSlot, { value: () => init });
}

export {
    NodeToReactionsLookup,
    reactWhenConnectedCached as reactWhenConnected,
    reactWhenDisconnectedCached as reactWhenDisconnected,
};
