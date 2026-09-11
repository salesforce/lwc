/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getCurrentInstance as getProtoInstance } from '../component';
import { getCurrentInstance as getCompatInstance, setInstanceRef } from '../compat/instance';
import { getCurrentOwner } from '../renderEffect';
import type { VaporInstance } from '../compat/lightning-element';

export function applyRefs(el: Element, name: string): void {
    // Prefer the compat (lwc-facade) instance when present, since that is what
    // standard-compiled components run under. Fall back to the prototype
    // instance used by the standalone vapor runtime tests.
    //
    // The compat `currentInstance` is only set during a full `renderInstance`
    // pass. A FINE-GRAINED branch re-render (e.g. an `lwc:if` toggling, which
    // re-runs only that `createIf` renderEffect) happens during the reactivity
    // flush — OUTSIDE any renderInstance — so `getCompatInstance()` is null
    // there. The render EFFECT, however, restores its owning instance as
    // `currentOwner` on every re-run (see renderEffect), so fall back to that:
    // without it, refs declared inside a conditional branch were dropped on
    // toggle and never re-applied (component/refs "ref with conditional").
    let compat = getCompatInstance();
    if (!compat) {
        // Fall back to the render effect's owner, but only if it's a COMPAT
        // instance (the standalone proto path uses `cmp.$refs` below). A compat
        // VaporInstance is identified by its `reactiveTarget`/`component` shape.
        const owner = getCurrentOwner() as VaporInstance | null;
        if (owner && (owner as { component?: unknown }).component !== undefined) {
            compat = owner;
        }
    }
    if (compat) {
        // Write to the instance's refs backing store directly. We must NOT go
        // through `component.refs`, because that getter intentionally returns
        // undefined (and logs) while the component is rendering — and applyRefs
        // runs precisely during render. Use the dedicated internal setter.
        setInstanceRef(compat, name, el);
        return;
    }

    const proto = getProtoInstance();
    if (!proto) return;
    if (!proto.cmp.$refs) {
        proto.cmp.$refs = {};
    }
    proto.cmp.$refs[name] = el;
}
