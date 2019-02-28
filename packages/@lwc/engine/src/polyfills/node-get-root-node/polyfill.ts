/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isNull, isTrue, isUndefined } from '../../shared/language';
import { parentNodeGetter } from '../../env/node';
import { getNodeOwner } from '../../faux-shadow/traverse';
import { getShadowRoot } from "../../faux-shadow/shadow-root";

const nativeGetRootNode = Node.prototype.getRootNode;

/**
 * Get the root by climbing up the dom tree, beyond the shadow root
 * If Node.prototype.getRootNode is supported, use it
 * else, assume we are working in non-native shadow mode and climb using parentNode
 */
const getDocumentOrRootNode: (this: Node, options?: GetRootNodeOptions) => Node = !isUndefined(nativeGetRootNode) ?
    nativeGetRootNode : 
    function(this: Node): Node{
        let node = this;
        let nodeParent: Node | null;
        while (!isNull(nodeParent = parentNodeGetter.call(node))) {
            node = nodeParent as Node;
        }
        return node;
    };

/**
 * Get the shadow root
 * getNodeOwner() returns the host element that owns the given node
 * Note: getNodeOwner() returns null when running in native-shadow mode.
 *  Fallback to using the native getRootNode() to discover the root node.
 *  This is because, it is not possible to inspect the node and decide if it is part
 *  of a native shadow or the synthetic shadow. 
 * @param {Node} node 
 */    
function getNearestRoot(node: Node): Node {
    const ownerNode: HTMLElement | null = getNodeOwner(node);

    if (isNull(ownerNode)) {
        // we hit a wall, either we are in native shadow mode or the node is not in lwc boundary.
        return getDocumentOrRootNode.call(node);
    }

    return getShadowRoot(ownerNode) as Node;
}

function patchedGetRootNode(this: Node, options?: GetRootNodeOptions): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        getDocumentOrRootNode.call(this, options) :
        getNearestRoot(this);
}

export default function apply() {
    defineProperty(Node.prototype, 'getRootNode', {
        value: patchedGetRootNode,
        enumerable: true,
        configurable: true
    });
}