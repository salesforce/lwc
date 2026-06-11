/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// This code is inspired by Polymer ShadyDOM Polyfill

import { getFilteredChildNodes } from '../../faux-shadow/traverse';
import { ELEMENT_NODE, COMMENT_NODE } from '../../env/node';

export function getTextContent(node: Node): string {
    switch (node.nodeType) {
        case ELEMENT_NODE: {
            const childNodes = getFilteredChildNodes(node);
            let content = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                const currentNode = childNodes[i];

                if (currentNode.nodeType !== COMMENT_NODE) {
                    content += getTextContent(currentNode);
                }
            }
            return content;
        }
        default:
            return node.nodeValue!;
    }
}
