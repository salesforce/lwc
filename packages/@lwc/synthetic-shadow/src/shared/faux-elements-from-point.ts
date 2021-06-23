/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined } from '@lwc/shared';
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

export function fauxElementsFromPoint(
    context: Node,
    doc: Document,
    left: number,
    top: number
): Element[] {
    if (process.env.NODE_ENV !== 'production') {
        /* eslint-disable-next-line no-console */
        console.warn(
            'elementsFromPoint() may return unpredictable results in different browsers, and is not recommended. ' +
                "Only use this API if you know what you're doing (or this is ChromeDriver, in which case " +
                'cross-browser compatibility is not a concern).'
        );
    }

    const elements: Element[] | null = elementsFromPoint.call(doc, left, top);
    const result = [];

    const rootNodes = getAllRootNodes(context);

    // Filter the elements array to only include those elements that are in this shadow root or in one of its
    // ancestor roots. This matches Chrome and Safari's implementation (but not Firefox's, which only includes
    // elements in the immediate shadow root: https://crbug.com/1207863#c4).
    if (!isNull(elements)) {
        // can be null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint#browser_compatibility
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (
                rootNodes.indexOf(element.getRootNode()) !== -1 &&
                !isSyntheticSlotElement(element)
            ) {
                result.push(element);
            }
        }
    }
    return result;
}
