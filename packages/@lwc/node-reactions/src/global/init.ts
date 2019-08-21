/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from '../types';
import { defineProperty, isUndefined } from '../shared/language';
import patchNodePrototype from '../dom-patching/node';
import patchNodePrototypeForEvents from '../dom-patching/node2';
import {
    reactWhenConnected as reactWhenConnected1,
    reactWhenDisconnected as reactWhenDisconnected1,
} from '../core/reactions';
import {
    reactWhenConnected as reactWhenConnected2,
    reactWhenDisconnected as reactWhenDisconnected2,
} from '../core/reactions2';

const {
    prototype: { constructor: DocumentConstructor, createElement },
} = Document;

const elm = createElement.call(document, 'p');
let isDOMNodeEventSupported = false;
// if DOMNodeInserted is triggered, we can assume all DOMNodeEvents are supported
elm.addEventListener('DOMNodeInserted', () => (isDOMNodeEventSupported = true));
createElement
    .call(document, 'div')
    .attachShadow({ mode: 'open' })
    .appendChild(elm);

let cachedAPI: {
    connected: (element: Element, callback: ReactionCallback) => void;
    disconnected: (element: Element, callback: ReactionCallback) => void;
};

/**
 * Path the DOM APIs and start monitoring dom mutations
 */
function patchDomApi(): void {
    if (isDOMNodeEventSupported) {
        patchNodePrototypeForEvents();
        cachedAPI = {
            connected: reactWhenConnected2,
            disconnected: reactWhenDisconnected2,
        };
    } else {
        patchNodePrototype();
        cachedAPI = {
            connected: reactWhenConnected1,
            disconnected: reactWhenDisconnected1,
        };
    }
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
            return cachedAPI;
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
