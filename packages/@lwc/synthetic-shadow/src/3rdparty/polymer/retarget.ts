/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined } from '@lwc/shared';
import { isSyntheticOrNativeShadowRoot } from '../../shared/utils';
import { pathComposer } from './path-composer';

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
export function retarget(refNode: EventTarget | null, path: EventTarget[]): EventTarget | null {
    if (isNull(refNode)) {
        return null;
    }
    // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.
    const refNodePath = pathComposer(refNode, true);
    const p$ = path;
    for (let i = 0, ancestor, lastRoot, root: Window | Node, rootIdx; i < p$.length; i++) {
        ancestor = p$[i];
        root = ancestor instanceof Window ? ancestor : (ancestor as Node).getRootNode();
        // Retarget to ancestor if ancestor is not shadowed
        if (!isSyntheticOrNativeShadowRoot(root)) {
            return ancestor;
        }
        if (root !== lastRoot) {
            rootIdx = refNodePath.indexOf(root);
            lastRoot = root;
        }
        // Retarget to ancestor if ancestor is shadowed by refNode's shadow root
        if (!isUndefined(rootIdx) && rootIdx > -1) {
            return ancestor;
        }
    }
    return null;
}
