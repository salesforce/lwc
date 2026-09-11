/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    type Block,
    type BlockFn,
    currentEnclosingBoundary,
    DynamicFragment,
    firstNode,
} from './block';
import { renderEffect } from './renderEffect';
import { notifySlotMembershipChanged } from './slot';

export function createIf(
    condition: () => any,
    positive: BlockFn,
    negative?: BlockFn,
    /** ANCHORLESS mode (engine-core parity): when provided, this `lwc:if` keeps NO
     *  persistent DOM marker — its bookend pair travels with rendered content and an
     *  empty branch contributes ZERO nodes. `nextSibling()` lazily resolves the node
     *  the content must stay BEFORE (the following block's first node, or null). */
    nextSibling?: () => Node | null,
    /** ANCHORLESS mode: a getter for the LAST DOM node of the PRECEDING sibling block —
     *  used to resolve the REAL parent when this if is empty and has no usable next
     *  sibling (the recorded mount container may be a cloned fragment that was emptied
     *  when its nodes moved into the real root). */
    prevSibling?: () => Node | null,
    /** LEGACY `if:true`/`if:false`: render NO `<!---->` bookends at all (engine-dom
     *  emits zero delimiters for the legacy directives), unlike `lwc:if` which brackets
     *  its content with a leading+trailing comment pair (api>=60). */
    noBookends?: boolean
): Block {
    const frag = new DynamicFragment();
    if (nextSibling !== undefined) {
        frag.anchorlessIf = true;
        if (noBookends) frag.noBookends = true;
        // Capture the enclosing anchorless block's trailing boundary NOW (at construction,
        // inside the encloser's render). On a later toggle this if's own next-sibling chain
        // may resolve null (it's last in its block); we then fall back to this boundary so
        // content lands BEFORE the encloser's end, not appended past it.
        frag.enclosingBoundary = currentEnclosingBoundary();
        // TDZ-safe (the getter may reference a block var declared later in document
        // order; during THIS if's initial synchronous render that `const` is in its TDZ).
        const safe = (fn?: () => Node | null): Node | null => {
            if (!fn) return null;
            try {
                return fn() ?? null;
            } catch {
                return null;
            }
        };
        frag.getNextSibling = () => safe(nextSibling);
        // Resolve the REAL parent dynamically (NOT the captured cloned fragment, which
        // is emptied after mount): next sibling's live parent → current content's parent
        // → preceding sibling's live parent → recorded mount container.
        frag.getParent = (): ParentNode | null => {
            const nx = safe(nextSibling);
            if (nx && nx.parentNode) return nx.parentNode;
            const own = firstNode(frag.nodes);
            if (own && own.parentNode) return own.parentNode;
            const pv = safe(prevSibling);
            if (pv && pv.parentNode) return pv.parentNode;
            return frag.recordedParent ?? null;
        };
    }
    // Track the previous branch so we can tell a genuine POST-MOUNT toggle (which
    // inserts/removes content) apart from a re-run that resolves the same branch.
    let prevBranch: BlockFn | undefined;
    let firstRun = true;
    renderEffect(() => {
        const branch = condition() ? positive : negative;
        frag.update(branch);
        // A branch TOGGLE changes this fragment's content MEMBERSHIP. Slot content
        // may contain a conditional whose freshly-inserted node needs to be picked
        // up by an enclosing forwarding `<slot>` (multi-level light-DOM forwarding):
        // the forwarding `createSlot`'s retag is memoized on the constant slot name
        // and never re-runs `body`, so a node the conditional adds later keeps its
        // authored `slot=` and is mis-distributed. Publishing on the MEMBERSHIP epoch
        // lets forwarding slots re-tag the new node — WITHOUT directly driving the
        // terminal `reorderLightSlots` (which subscribes to the slotAttr epoch and does
        // destructive DOM moves): only an actual re-tag then bumps slotAttr. Bump ONLY on
        // a genuine post-mount toggle: the INITIAL render's content is already retagged
        // inline by the enclosing forwarding slot's `body` (the createIf resolves
        // synchronously inside `slotFn`, so `retagSlot` recurses into it), so a
        // mount-time bump would be redundant; a same-branch re-run is inert too.
        if (!firstRun && branch !== prevBranch) {
            notifySlotMembershipChanged();
        }
        prevBranch = branch;
        firstRun = false;
    });
    return frag;
}
