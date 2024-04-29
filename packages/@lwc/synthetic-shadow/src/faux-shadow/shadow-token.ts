/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    defineProperty,
    isUndefined,
    KEY__SHADOW_TOKEN,
    KEY__SHADOW_TOKEN_PRIVATE,
    KEY__SHADOW_STATIC,
    KEY__SHADOW_STATIC_PRIVATE,
    KEY__SHADOW_RESOLVER,
    isNull,
} from '@lwc/shared';
import { setAttribute, removeAttribute } from '../env/element';
import { firstChildGetter, nextSiblingGetter, parentNodeGetter } from '../env/node';

export function getShadowToken(node: Node): string | undefined {
    return (node as any)[KEY__SHADOW_TOKEN];
}
export function setShadowToken(node: Node, shadowToken: string | undefined) {
    (node as any)[KEY__SHADOW_TOKEN] = shadowToken;
}

/**
 * Patching Element.prototype.$shadowToken$ to mark elements a portal:
 * - we use a property to allow engines to set a custom attribute that should be
 * placed into the element to sandbox the css rules defined for the template.
 * - this custom attribute must be unique.
 */
defineProperty(Element.prototype, KEY__SHADOW_TOKEN, {
    set(this: Element, shadowToken: string | undefined) {
        const oldShadowToken = (this as any)[KEY__SHADOW_TOKEN_PRIVATE];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        (this as any)[KEY__SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get(this: Element): string | undefined {
        return (this as any)[KEY__SHADOW_TOKEN_PRIVATE];
    },
    configurable: true,
});

function recursivelySetShadowResolver(root: Node, fn: any) {
    // Recurse using firstChild/nextSibling because browsers use a linked list under the hood to
    // represent the DOM, so childNodes/children would cause an unnecessary array allocation.
    // https://viethung.space/blog/2020/09/01/Browser-from-Scratch-DOM-API/#Choosing-DOM-tree-data-structure
    // Also, we use `parentNode` to avoid a stack/recursion for perf: https://github.com/salesforce/lwc/pull/4181
    let node: Node | null = root;
    while (!isNull(node)) {
        // visit node
        (node as any)[KEY__SHADOW_RESOLVER] = fn;

        const child: Node | null = firstChildGetter.call(node);
        if (!isNull(child)) {
            // walk down
            node = child;
        } else {
            let sibling: Node | null;
            while (isNull((sibling = nextSiblingGetter.call(node!)))) {
                if (node === root) {
                    // We have traversed back up to the root; we are done
                    return;
                }
                // walk up
                node = parentNodeGetter.call(node!);
            }
            // walk right
            node = sibling;
        }
    }
}

defineProperty(Element.prototype, KEY__SHADOW_STATIC, {
    set(this: Element, v: boolean) {
        // Marking an element as static will propagate the shadow resolver to the children.
        if (v) {
            const fn = (this as any)[KEY__SHADOW_RESOLVER];
            recursivelySetShadowResolver(this, fn);
        }
        (this as any)[KEY__SHADOW_STATIC_PRIVATE] = v;
    },
    get(this: Element): string | undefined {
        return (this as any)[KEY__SHADOW_STATIC_PRIVATE];
    },
    configurable: true,
});
