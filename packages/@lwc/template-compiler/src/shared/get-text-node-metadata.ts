/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { BaseParentNode, Text } from './types';

export function getPreviousAdjacentSiblings(node: Text, parent: BaseParentNode, preserveComments: boolean) {
    const siblings = []
    for (let i = 0; i < parent.children.length; i++) {
        const otherChild = parent.children[i]
        if (otherChild === node) {
            return siblings
        } else if (node.type === 'Text' || (node.type === 'Comment' && !preserveComments)) {
            siblings.push(node)
        }
    }
}
