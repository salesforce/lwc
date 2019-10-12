/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isNull, isUndefined } from '@lwc/shared';
import { parentNodeGetter } from '../env/node';

// DO NOT CHANGE this:
// these two values need to be in sync with engine
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export function getNodeOwnerKey(node: Node): number | undefined {
    return node[OwnerKey];
}

export function setNodeOwnerKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the owner key
        defineProperty(node, OwnerKey, {
            value,
            configurable: true,
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnerKey] = value;
    }
}

export function setNodeKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the own key
        defineProperty(node, OwnKey, {
            value, // can't be mutated
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnKey] = value;
    }
}

export function getNodeNearestOwnerKey(node: Node): number | undefined {
    let ownerNode: Node | null = node;
    let ownerKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(ownerNode)) {
        ownerKey = ownerNode[OwnerKey];
        if (!isUndefined(ownerKey)) {
            return ownerKey;
        }
        ownerNode = parentNodeGetter.call(ownerNode);
    }
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}

export function isNodeShadowed(node: Node): boolean {
    return !isUndefined(getNodeNearestOwnerKey(node));
}
