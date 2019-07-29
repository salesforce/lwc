/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export enum ReactionEventType {
    connected = 'connected',
    disconnected = 'disconnected',
}

export type ReactionCallback = (this: Node, reactionEventType: ReactionEventType) => void;

export interface ReactionEvent {
    type: ReactionEventType;
    callback: ReactionCallback;
    node: Node;
}
