/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isTrue, isUndefined } from '../../shared/language';
import { getRootNode as nativeGetRootNode } from "../../env/node";
import { getNodeOwner } from '../../faux-shadow/traverse';
import { getShadowRoot } from "../../faux-shadow/shadow-root";

function getRoot(node: Node): Node {
    const ownerNode: HTMLElement | null = getNodeOwner(node);

    if (isNull(ownerNode)) {
        // we hit a wall, is not in lwc boundary.
        return nativeGetRootNode.call(node);
    }

    return getShadowRoot(ownerNode) as Node;
}

function getRootNode(this: Node, options?: GetRootNodeOptions): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        nativeGetRootNode.call(this, options) :
        getRoot(this);
}

export default function apply() {
    Node.prototype.getRootNode = getRootNode;
}