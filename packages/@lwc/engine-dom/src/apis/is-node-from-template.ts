/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    getPrototypeOf,
    hasOwnProperty,
    isFalse,
    isUndefined,
    KEY__SHADOW_RESOLVER,
} from '@lwc/shared';
import { isSyntheticShadowDefined } from '../renderer';

// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line lwc-internal/no-global-node
const _Node = Node;

/**
 * EXPERIMENTAL: The purpose of this function is to detect shadowed nodes. As noted below, it
 * returns `false` for nodes that are manually inserted without using the `lwc:dom="manual"`
 * directive within a synthetic root.
 *
 * This API can be removed once Locker V1 is no longer supported.
 */
function isNodeShadowed(node: Node): boolean {
    if (isFalse(node instanceof _Node)) {
        return false;
    }
    // TODO [#1250]: skipping the shadowRoot instances itself makes no sense, we need to revisit
    // this with locker
    if (node instanceof ShadowRoot) {
        return false;
    }

    const rootNode = node.getRootNode();
    const isShadowRootInstance = rootNode instanceof ShadowRoot;
    if (
        isShadowRootInstance &&
        isFalse(hasOwnProperty.call(getPrototypeOf(rootNode), 'synthetic'))
    ) {
        return true;
    }

    if (isSyntheticShadowDefined) {
        // TODO [#1252]: old behavior that is still used by some pieces of the platform,
        // specifically, nodes inserted manually on places where `lwc:dom="manual"` directive is not
        // used, will be considered global elements.
        return !isUndefined((node as any)[KEY__SHADOW_RESOLVER]);
    }

    return isShadowRootInstance;
}

// Rename to maintain backcompat
export { isNodeShadowed as isNodeFromTemplate };
