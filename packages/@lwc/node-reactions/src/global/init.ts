/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback } from '../types';
import { DocumentPrototype } from '../env/document';
import { defineProperty, create, isUndefined } from '../shared/language';
import { createFieldName } from '../shared/fields';
import patchNodePrototype from '../dom-patching/node';
import { reactToConnection, reactToDisconnection } from '../core/reactions';

/**
 * Path the DOM APIs and start monitoring dom mutations
 */
function patchDomApi(): void {
    patchNodePrototype();
}

const InitializationSlot = '$$node-reactions-initialized$$';
let NodeToCallbackLookup: symbol;
let reactToConnectionCached: (elm: Element, callback: ReactionCallback) => void;
let reactToDisconnectionCached: (elm: Element, callback: ReactionCallback) => void;

/**
 * Set an internal field to detect initialization
 */
export function initialize(): void {
    if (!isUndefined((document as any)[InitializationSlot])) {
        const cached = (document as any)[InitializationSlot];
        reactToConnectionCached = cached[ReactionEventType.connected];
        reactToDisconnectionCached = cached[ReactionEventType.disconnected];
        NodeToCallbackLookup = cached['NodeToCallbackLookup'];
        return;
    }
    patchDomApi();
    const init = create(null);
    reactToConnectionCached = init[ReactionEventType.connected] = reactToConnection;
    reactToDisconnectionCached = init[ReactionEventType.disconnected] = reactToDisconnection;
    NodeToCallbackLookup = init['NodeToCallbackLookup'] = createFieldName('callback-lookup');
    defineProperty(DocumentPrototype, InitializationSlot, { value: init });
}

export { NodeToCallbackLookup, reactToConnectionCached, reactToDisconnectionCached };
