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
import { renderer } from '../renderer';

// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line @lwc/lwc-internal/no-global-node
const _Node = Node;

/**
 * EXPERIMENTAL: The purpose of this function is to detect shadowed nodes. THIS API WILL BE REMOVED
 * ONCE LOCKER V1 IS NO LONGER SUPPORTED.
 */
function isNodeShadowed(node: Node): boolean {
    if (isFalse(node instanceof _Node)) {
        return false;
    }

    // It's debatable whether shadow root instances should be considered as shadowed, but we keep
    // this unchanged for legacy reasons (#1250).
    if (node instanceof ShadowRoot) {
        return false;
    }

    const rootNode = node.getRootNode();

    // Handle the native case. We can return early here because an invariant of LWC is that
    // synthetic roots cannot be descendants of native roots.
    if (
        rootNode instanceof ShadowRoot &&
        isFalse(hasOwnProperty.call(getPrototypeOf(rootNode), 'synthetic'))
    ) {
        return true;
    }

    // TODO [#1252]: Old behavior that is still used by some pieces of the platform. Manually
    // inserted nodes without the `lwc:dom=manual` directive will be considered as global elements.
    return renderer.isSyntheticShadowDefined && !isUndefined((node as any)[KEY__SHADOW_RESOLVER]);
}

// Rename to maintain backcompat
export { isNodeShadowed as isNodeFromTemplate };
