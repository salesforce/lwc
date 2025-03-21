/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isNull, isUndefined, assert } from '@lwc/shared';
import { isVStaticPartElement, isVStaticPartText } from '../vnodes';
import { applyEventListeners } from './events';
import { applyRefs } from './refs';
import { patchAttributes } from './attrs';
import { patchStyleAttribute } from './computed-style-attr';
import { patchClassAttribute } from './computed-class-attr';
import { patchTextVStaticPart } from './text';
import type { RendererAPI } from '../renderer';
import type { VStatic, VStaticPart, VStaticPartElement, VStaticPartText } from '../vnodes';

/**
 * Given an array of static parts, mounts the DOM element to the part based on the staticPartId
 * @param root the root element
 * @param parts an array of VStaticParts
 * @param renderer the renderer to use
 */
export function traverseAndSetElements(
    root: Element,
    parts: VStaticPart[],
    renderer: RendererAPI
): void {
    const numParts = parts.length;

    // Optimization given that, in most cases, there will be one part, and it's just the root
    if (numParts === 1) {
        const firstPart = parts[0];
        if (firstPart.partId === 0) {
            // 0 means the root node
            firstPart.elm = root;
            return;
        }
    }

    const partIdsToParts = new Map<number, VStaticPart>();
    for (const staticPart of parts) {
        partIdsToParts.set(staticPart.partId, staticPart);
    }

    // Note that we traverse using `*Child`/`*Sibling` rather than `children` because the browser uses a linked
    // list under the hood to represent the DOM tree, so it's faster to do this than to create an underlying array
    // by calling `children`.
    const { nextSibling, getFirstChild, getParentNode } = renderer;
    let numFoundParts = 0;
    let partId = -1;

    // We should never traverse up to the root. We should exit early due to numFoundParts === numParts.
    // This is just a sanity check, in case the static parts generated by @lwc/template-compiler are wrong.
    function assertNotRoot(node: Element | Text | null) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                node === root,
                `Reached the root without finding all parts. Found ${numFoundParts}, needed ${numParts}.`
            );
        }
    }

    // Depth-first traversal. We assign a partId to each element, which is an integer based on traversal order.
    // This function is very hot, which is why it's micro-optimized. Note we don't use a stack at all; we traverse
    // using an algorithm that relies on the parentNode getter: https://stackoverflow.com/a/5285417
    // This is very slightly faster than a TreeWalker (~0.5% on js-framework-benchmark create-10k), but basically
    // the same idea.
    let node: Element | Text | null = root;
    while (!isNull(node)) {
        // visit node
        partId++;
        const part = partIdsToParts.get(partId);
        if (!isUndefined(part)) {
            part.elm = node;
            numFoundParts++;
            if (numFoundParts === numParts) {
                return; // perf optimization - stop traversing once we've found everything we need
            }
        }

        const child = getFirstChild(node);
        if (!isNull(child)) {
            // walk down
            node = child;
        } else {
            let sibling: Element | Text | null;
            while (isNull((sibling = nextSibling(node)))) {
                // we never want to walk up from the root
                assertNotRoot(node);
                // walk up
                node = getParentNode(node);
            }
            // we never want to walk right from the root
            assertNotRoot(node);
            // walk right
            node = sibling;
        }
    }

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            numFoundParts === numParts,
            `Should have found all parts by now. Found ${numFoundParts}, needed ${numParts}.`
        );
    }
}

/**
 * Given an array of static parts, do all the mounting required for these parts.
 * @param root the root element
 * @param vnode the parent VStatic
 * @param renderer the renderer to use
 */
export function mountStaticParts(root: Element, vnode: VStatic, renderer: RendererAPI): void {
    // On the server, we don't support ref (because it relies on renderedCallback), nor do we
    // support event listeners (no interactivity), so traversing parts makes no sense
    if (!process.env.IS_BROWSER) {
        return;
    }
    const { parts, owner } = vnode;
    if (isUndefined(parts)) {
        return;
    }

    // This adds `part.elm` to each `part`. We have to do this on every mount because the `parts`
    // array is recreated from scratch every time, so each `part.elm` is now undefined.
    traverseAndSetElements(root, parts, renderer);

    // Currently only event listeners and refs are supported for static vnodes
    for (const part of parts) {
        if (isVStaticPartElement(part)) {
            // Event listeners only need to be applied once when mounting
            applyEventListeners(part, renderer);
            // Refs must be updated after every render due to refVNodes getting reset before every render
            applyRefs(part, owner);
            patchAttributes(null, part, renderer);
            patchClassAttribute(null, part, renderer);
            patchStyleAttribute(null, part, renderer, owner);
        } else {
            if (process.env.NODE_ENV !== 'production' && !isVStaticPartText(part)) {
                throw new Error(
                    `LWC internal error, encountered unknown static part type: ${part.type}`
                );
            }
            patchTextVStaticPart(null, part as VStaticPartText, renderer);
        }
    }
}

/**
 * Updates the static elements based on the content of the VStaticParts
 * @param n1 the previous VStatic vnode
 * @param n2 the current VStatic vnode
 * @param renderer the renderer to use
 */
export function patchStaticParts(n1: VStatic, n2: VStatic, renderer: RendererAPI) {
    // On the server, we don't support ref (because it relies on renderedCallback), nor do we
    // support event listeners (no interactivity), so traversing parts makes no sense
    if (!process.env.IS_BROWSER) {
        return;
    }

    const { parts: currParts, owner: currPartsOwner } = n2;
    if (isUndefined(currParts)) {
        return;
    }

    const { parts: prevParts } = n1;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            currParts.length === prevParts?.length,
            'Expected static parts to be the same for the same element. This is an error with the LWC framework itself.'
        );
    }

    for (let i = 0; i < currParts.length; i++) {
        const prevPart = prevParts![i];
        const part = currParts[i];
        // Patch only occurs if the vnode is newly generated, which means the part.elm is always undefined
        // Since the vnode and elements are the same we can safely assume that prevParts[i].elm is defined.
        part.elm = prevPart.elm;

        if (process.env.NODE_ENV !== 'production' && prevPart.type !== part.type) {
            throw new Error(
                `LWC internal error, static part types do not match. Previous type was ${prevPart.type} and current type is ${part.type}`
            );
        }

        if (isVStaticPartElement(part)) {
            // Refs must be updated after every render due to refVNodes getting reset before every render
            applyRefs(part, currPartsOwner);
            patchAttributes(prevPart as VStaticPartElement, part, renderer);
            patchClassAttribute(prevPart as VStaticPartElement, part, renderer);
            patchStyleAttribute(prevPart as VStaticPartElement, part, renderer, currPartsOwner);
        } else {
            patchTextVStaticPart(null, part as VStaticPartText, renderer);
        }
    }
}

/**
 * Mounts the hydration specific attributes
 * @param vnode the parent VStatic node
 * @param renderer the renderer to use
 */
export function hydrateStaticParts(vnode: VStatic, renderer: RendererAPI): void {
    if (!process.env.IS_BROWSER) {
        return;
    }

    const { parts, owner } = vnode;
    if (isUndefined(parts)) {
        return;
    }

    // Note, hydration doesn't patch attributes because hydration validation occurs before this routine
    // which guarantees that the elements are the same.
    // We only need to apply the parts for things that cannot be done on the server.
    for (const part of parts) {
        if (isVStaticPartElement(part)) {
            // Event listeners only need to be applied once when mounting
            applyEventListeners(part, renderer);
            // Refs must be updated after every render due to refVNodes getting reset before every render
            applyRefs(part, owner);
        }
    }
}
