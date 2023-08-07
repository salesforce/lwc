/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Node, Container } from 'postcss-selector-parser';

export function findNode<T extends Node>(
    container: Container,
    predicate: (node: Node) => node is T
): T | undefined {
    return container && container.nodes && container.nodes.find(predicate);
}

export function replaceNodeWith(oldNode: Node, ...newNodes: Node[]): void {
    if (newNodes.length) {
        const { parent } = oldNode;

        if (!parent) {
            throw new Error(`Impossible to replace root node.`);
        }

        newNodes.forEach((node) => {
            parent.insertBefore(oldNode, node);
        });

        oldNode.remove();
    }
}

export function trimNodeWhitespaces(node: Node): void {
    if (node && node.spaces) {
        node.spaces.before = '';
        node.spaces.after = '';
    }
}
