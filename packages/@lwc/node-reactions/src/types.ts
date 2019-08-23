/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type ReactionType = 'connected' | 'disconnected';

export type ReactionCallback = (this: Element, reactionType: ReactionType) => void;

export interface ReactionRecord {
    type: ReactionType;
    callback: ReactionCallback;
    element: Element;
}

export interface QualfyingReactionTypes {
    connected?: boolean;
    disconnected?: boolean;
}
