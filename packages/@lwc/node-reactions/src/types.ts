/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type ReactionType = 1 /* connected */ | 2 /* disconnected */;

export type ReactionCallback = (
    this: undefined,
    element: Element,
    reactionType: ReactionType
) => void;

export interface ReactionRecord {
    type: ReactionType;
    callback: ReactionCallback;
    element: Element;
}

export type QualifyingReactionTypes = number; /* 0: none, 1: connected, 2: disconnected */
