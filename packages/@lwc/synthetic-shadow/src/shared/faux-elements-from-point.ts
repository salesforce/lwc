/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayIndexOf, ArrayPush, isNull, isUndefined } from '@lwc/shared';
import { elementsFromPoint } from '../env/document';
import { isSyntheticSlotElement } from '../faux-shadow/traverse';

// Walk up the DOM tree, collecting all shadow roots plus the document root
function getAllRootNodes(node: Node) {
    const rootNodes = [];
    let currentRootNode = node.getRootNode();
    while (!isUndefined(currentRootNode)) {
        rootNodes.push(currentRootNode);
        currentRootNode = (currentRootNode as ShadowRoot).host?.getRootNode();
    }
    return rootNodes;
}

// Keep searching up the host tree until we find an element that is within the immediate shadow root
const findAncestorHostInImmediateShadowRoot = (rootNode: Node, targetRootNode: Node) => {
    let host;
    while (!isUndefined((host = (rootNode as any).host))) {
        const thisRootNode = host.getRootNode();
        if (thisRootNode === targetRootNode) {
            return host;
        }
        rootNode = thisRootNode;
    }
};

export function fauxElementsFromPoint(
    context: Node,
    doc: Document,
    left: number,
    top: number
): Element[] {
    const elements: Element[] | null = elementsFromPoint.call(doc, left, top);
    const result: Element[] = [];

    const rootNodes = getAllRootNodes(context);

    // Filter the elements array to only include those elements that are in this shadow root or in one of its
    // ancestor roots. This matches Chrome and Safari's implementation (but not Firefox's, which only includes
    // elements in the immediate shadow root: https://crbug.com/1207863#c4).
    if (!isNull(elements)) {
        // can be null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint#browser_compatibility
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (isSyntheticSlotElement(element)) {
                continue;
            }
            const elementRootNode = element.getRootNode();

            if (ArrayIndexOf.call(rootNodes, elementRootNode) !== -1) {
                ArrayPush.call(result, element);
                continue;
            }
            // In cases where the host element is not visible but its shadow descendants are, then
            // we may get the shadow descendant instead of the host element here. (The
            // browser doesn't know the difference in synthetic shadow DOM.)
            // In native shadow DOM, however, elementsFromPoint would return the host but not
            // the child. So we need to detect if this shadow element's host is accessible from
            // the context's shadow root. Note we also need to be careful not to add the host
            // multiple times.
            const ancestorHost = findAncestorHostInImmediateShadowRoot(
                elementRootNode,
                rootNodes[0]
            );
            if (
                !isUndefined(ancestorHost) &&
                ArrayIndexOf.call(elements, ancestorHost) === -1 &&
                ArrayIndexOf.call(result, ancestorHost) === -1
            ) {
                ArrayPush.call(result, ancestorHost);
            }
        }
    }
    return result;
}
