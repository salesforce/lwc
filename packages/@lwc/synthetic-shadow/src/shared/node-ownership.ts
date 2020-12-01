/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isNull, isUndefined } from '@lwc/shared';
import { parentNodeGetter } from '../env/node';

// Used as a back reference to identify the host element
const HostElementKey = '$$HostElementKey$$';
const ShadowedNodeKey = '$$ShadowedNodeKey$$';

interface ShadowedNode extends Node {
    [HostElementKey]: number;
    [ShadowedNodeKey]: number;
}

export function getNodeOwnerKey(node: Node): number | undefined {
    return (node as ShadowedNode)[HostElementKey];
}

export function setNodeOwnerKey(node: Node, value: number) {
    const shadowedNode = node as ShadowedNode;
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the owner key
        defineProperty(shadowedNode, HostElementKey, {
            value,
            configurable: true,
        });
    } else {
        // in prod, for better perf, we just let it roll
        shadowedNode[HostElementKey] = value;
    }
}

export function setNodeKey(node: Node, value: number) {
    const shadowedNode = node as ShadowedNode;
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the own key
        defineProperty(shadowedNode, ShadowedNodeKey, {
            value, // can't be mutated
        });
    } else {
        // in prod, for better perf, we just let it roll
        shadowedNode[ShadowedNodeKey] = value;
    }
}

export function getNodeNearestOwnerKey(node: Node): number | undefined {
    let host = node as ShadowedNode | null;
    let hostKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(host)) {
        hostKey = host[HostElementKey];
        if (!isUndefined(hostKey)) {
            return hostKey;
        }
        host = parentNodeGetter.call(host) as ShadowedNode | null;
    }
}

export function getNodeKey(node: Node): number | undefined {
    return (node as ShadowedNode)[ShadowedNodeKey];
}

/**
 * This function does not traverse up for performance reasons, but is sufficient for most use
 * cases. If we need to traverse up and verify those nodes that don't have owner key, use
 * isNodeDeepShadowed instead.
 */
export function isNodeShadowed(node: Node): boolean {
    return !isUndefined(getNodeOwnerKey(node));
}

/**
 * This function verifies if a node (with or without owner key) is contained in a shadow root.
 * Use with care since has high computational cost.
 */
export function isNodeDeepShadowed(node: Node): boolean {
    return !isUndefined(getNodeNearestOwnerKey(node));
}
