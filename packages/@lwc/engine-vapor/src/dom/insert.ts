/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { insertBlock, removeBlock, type Block } from '../block';

export function insert(block: Block, parent: ParentNode, anchor: Node | null = null): void {
    insertBlock(block, parent, anchor);
}

/**
 * Insert a STATIC child component at its compiler-emitted positional anchor, then
 * REMOVE that anchor comment. The anchor is a one-time placeholder (`<!---->`) the
 * compiler bakes into the static template so the component lands at the right
 * position; unlike an `lwc:if`/`for:each`/`<slot>` anchor it is never reused for a
 * re-render, so leaving it in the DOM just pollutes the parent's child list (e.g. a
 * trailing `<!---->` as a direct shadow-root child, which breaks test tree-walkers
 * that call `el.hasAttribute` on every child, and diverges from engine-dom's shape).
 * Only a bare compiler anchor (no fragment-owner marker) is removed.
 */
export function insertStatic(block: Block, parent: ParentNode, anchor: Node | null = null): void {
    insertBlock(block, parent, anchor);
    if (
        anchor &&
        anchor.nodeType === 8 /* Comment */ &&
        !(anchor as { __ownerFrag?: boolean }).__ownerFrag &&
        anchor.parentNode
    ) {
        anchor.parentNode.removeChild(anchor);
    }
}

export function remove(block: Block, parent: ParentNode): void {
    removeBlock(block, parent);
}
