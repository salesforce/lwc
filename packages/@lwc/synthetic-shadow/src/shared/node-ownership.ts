/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isNull, isUndefined } from '@lwc/shared';
import { parentNodeGetter } from '../env/node';
import { containsHost, isHostElement } from '../faux-shadow/shadow-root';

// Used as a back reference to identify the host element
const HostElementKey = '$$HostElementKey$$';
const ShadowedNodeKey = '$$ShadowedNodeKey$$';

interface ShadowedNode extends Node {
    [HostElementKey]: number;
    [ShadowedNodeKey]: number;
}

function fastDefineProperty(
    node: Node,
    propName: typeof HostElementKey | typeof ShadowedNodeKey,
    config: { value: number; configurable?: boolean }
) {
    const shadowedNode = node as ShadowedNode;
    if (process.env.NODE_ENV !== 'production') {
        // in dev, we are more restrictive
        defineProperty(shadowedNode, propName, config);
    } else {
        const { value } = config;
        // in prod, we prioritize performance
        shadowedNode[propName] = value;
    }
}

export function setNodeOwnerKey(node: Node, value: number) {
    fastDefineProperty(node, HostElementKey, { value, configurable: true });
}

export function setNodeKey(node: Node, value: number) {
    fastDefineProperty(node, ShadowedNodeKey, { value });
}

export function getNodeOwnerKey(node: Node): number | undefined {
    return (node as ShadowedNode)[HostElementKey];
}

export function getNodeNearestOwnerKey(node: Node): number | undefined {
    let host: Node | null = node;
    let hostKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(host)) {
        hostKey = getNodeOwnerKey(host);
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

/**
 * Returns true if this node is a shadow host, is in a shadow host, or contains a shadow host
 * anywhere in its tree.
 */
export function isNodeOrDescendantsShadowed(node: Node): boolean {
    return isNodeShadowed(node) || isHostElement(node) || containsHost(node);
}
