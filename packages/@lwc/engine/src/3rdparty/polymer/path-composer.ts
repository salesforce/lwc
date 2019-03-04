/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { DOCUMENT_FRAGMENT_NODE } from './../../env/node';
import { patchedGetRootNode } from './../../faux-shadow/traverse';

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
export function pathComposer(startNode: Node, composed: boolean): Node[] {
    const composedPath: HTMLElement[] = [];
    let current = startNode;
    const startRoot = (startNode as any) === window ? window : patchedGetRootNode.call(startNode);
    while (current) {
        composedPath.push(current as HTMLElement);
        if ((current as HTMLElement).assignedSlot) {
            current = (current as HTMLElement).assignedSlot as HTMLSlotElement;
        } else if (
            (current as HTMLElement).nodeType === DOCUMENT_FRAGMENT_NODE &&
            (current as ShadowRoot).host &&
            (composed || current !== startRoot)
        ) {
            current = (current as ShadowRoot).host as HTMLElement;
        } else {
            current = (current as HTMLElement).parentNode as any;
        }
    }
    // event composedPath includes window when startNode's ownerRoot is document
    if ((composedPath[composedPath.length - 1] as any) === document) {
        composedPath.push(window as any);
    }
    return composedPath;
}
