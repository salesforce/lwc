/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// key in engine service context for wire service context
export const CONTEXT_ID = '@wire';
// key in wire service context for updated listener metadata
export const CONTEXT_UPDATED = 'updated';
// key in wire service context for connected listener metadata
export const CONTEXT_CONNECTED = 'connected';
// key in wire service context for disconnected listener metadata
export const CONTEXT_DISCONNECTED = 'disconnected';

// wire event target life cycle connectedCallback hook event type
export const CONNECT = 'connect';
// wire event target life cycle disconnectedCallback hook event type
export const DISCONNECT = 'disconnect';
// wire event target life cycle config changed hook event type
export const CONFIG = 'config';
