/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { pathComposer } from "./path-composer";
import { patchedGetRootNode } from "./../../faux-shadow/traverse";
import { SyntheticShadowRoot } from "./../../faux-shadow/shadow-root";

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
export function retarget(refNode: Node, path: Node[]): EventTarget | null {
    // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.
    const refNodePath = pathComposer(refNode, true);
    const p$ = path;
    for (let i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
        ancestor = p$[i];
        root = ancestor === window ? window : patchedGetRootNode.call(ancestor);
        if (root !== lastRoot) {
            rootIdx = refNodePath.indexOf(root);
            lastRoot = root;
        }
        if (!(root instanceof SyntheticShadowRoot) || rootIdx > -1) {
            return ancestor;
        }
    }
    return null;
}
