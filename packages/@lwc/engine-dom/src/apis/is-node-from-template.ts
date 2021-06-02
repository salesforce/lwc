/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    hasOwnProperty,
    isFalse,
    isUndefined,
    KEY__SHADOW_RESOLVER,
    KEY__SHADOW_TOKEN,
} from '@lwc/shared';

/**
 * EXPERIMENTAL: This function detects whether or not a Node is controlled by a LWC template. This
 * API is subject to change or being removed.
 */
export function isNodeFromTemplate(node: Node): boolean {
    if (isFalse(node instanceof Node)) {
        return false;
    }
    // TODO [#1250]: skipping the shadowRoot instances itself makes no sense, we need to revisit
    // this with locker
    if (node instanceof ShadowRoot) {
        return false;
    }
    if (hasOwnProperty.call(Element.prototype, KEY__SHADOW_TOKEN)) {
        // TODO [#1252]: old behavior that is still used by some pieces of the platform,
        // specifically, nodes inserted manually on places where `lwc:dom="manual"` directive is not
        // used, will be considered global elements.
        return !isUndefined((node as any)[KEY__SHADOW_RESOLVER]);
    }
    const root = node.getRootNode();
    return root instanceof ShadowRoot;
}
