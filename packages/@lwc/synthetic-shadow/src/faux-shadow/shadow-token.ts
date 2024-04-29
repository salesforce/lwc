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
} from '@lwc/shared';
import { setAttribute, removeAttribute } from '../env/element';
import { nextSiblingGetter } from '../env/node';

const treeWalker = document.createTreeWalker(
    document,
    // NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT
    133
);

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

function traverseAndSetShadowResolver(root: Node, fn: any) {
    // Avoid re-creating the TreeWalker for perf
    treeWalker.currentNode = root;
    const nextSiblingOfRoot = nextSiblingGetter.call(root);
    let node: Node | null;
    // Do not traverse past the next sibling of the root (or null if it doesn't exist)
    while ((node = treeWalker.nextNode()) !== nextSiblingOfRoot) {
        (node as any)[KEY__SHADOW_RESOLVER] = fn;
    }
}

defineProperty(Element.prototype, KEY__SHADOW_STATIC, {
    set(this: Element, v: boolean) {
        // Marking an element as static will propagate the shadow resolver to the children.
        if (v) {
            const fn = (this as any)[KEY__SHADOW_RESOLVER];
            traverseAndSetShadowResolver(this, fn);
        }
        (this as any)[KEY__SHADOW_STATIC_PRIVATE] = v;
    },
    get(this: Element): string | undefined {
        return (this as any)[KEY__SHADOW_STATIC_PRIVATE];
    },
    configurable: true,
});
