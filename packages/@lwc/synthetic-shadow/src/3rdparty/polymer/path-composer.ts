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

import { isNull } from '@lwc/shared';
import { getOwnerDocument } from '../../shared/utils';
import { Node } from '../../env/node';
import { isInstanceOfNativeShadowRoot } from '../../env/shadow-root';
import { isSyntheticShadowRoot } from '../../faux-shadow/shadow-root';

export function pathComposer(startNode: EventTarget, composed: boolean): EventTarget[] {
    const composedPath: EventTarget[] = [];

    let startRoot: Window | Node;
    if (startNode instanceof Window) {
        startRoot = startNode;
    } else if (startNode instanceof Node) {
        startRoot = startNode.getRootNode();
    } else {
        return composedPath;
    }

    let current: Window | Node | null = startNode;
    while (!isNull(current)) {
        composedPath.push(current);

        if (current instanceof Element || current instanceof Text) {
            const assignedSlot: HTMLSlotElement | null = current.assignedSlot;
            if (!isNull(assignedSlot)) {
                current = assignedSlot;
            } else {
                current = current.parentNode;
            }
        } else if (
            (isSyntheticShadowRoot(current) || isInstanceOfNativeShadowRoot(current)) &&
            (composed || current !== startRoot)
        ) {
            current = (current as ShadowRoot).host;
        } else if (current instanceof Node) {
            current = current.parentNode;
        } else {
            // could be Window
            current = null;
        }
    }

    let doc: Document;
    if (startNode instanceof Window) {
        doc = startNode.document;
    } else {
        doc = getOwnerDocument(startNode as Node);
    }

    // event composedPath includes window when startNode's ownerRoot is document
    if ((composedPath[composedPath.length - 1] as any) === doc) {
        composedPath.push(window);
    }
    return composedPath;
}
