/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isFalse, isUndefined, KEY__SHADOW_RESOLVER } from '@lwc/shared';
import { isSyntheticShadowDefined } from '../renderer';

// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line lwc-internal/no-global-node
const _Node = Node;

/**
 * EXPERIMENTAL: This function detects whether or not a Node is controlled by a LWC template. This
 * API is subject to change or being removed.
 */
export function isNodeFromTemplate(node: Node): boolean {
    if (isFalse(node instanceof _Node)) {
        return false;
    }
    // TODO [#1250]: skipping the shadowRoot instances itself makes no sense, we need to revisit
    // this with locker
    if (node instanceof ShadowRoot) {
        return false;
    }
    if (isSyntheticShadowDefined) {
        // TODO [#1252]: old behavior that is still used by some pieces of the platform,
        // specifically, nodes inserted manually on places where `lwc:dom="manual"` directive is not
        // used, will be considered global elements.
        return !isUndefined((node as any)[KEY__SHADOW_RESOLVER]);
    }
    const root = node.getRootNode();
    return root instanceof ShadowRoot;
}
