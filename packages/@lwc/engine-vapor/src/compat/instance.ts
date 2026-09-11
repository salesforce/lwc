/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { onScopeDispose } from '../scope';
import type { Block } from '../block';
import type { VaporInstance } from './lightning-element';

export type VaporRenderFn = (cmp: any, slotset: Record<string, () => Block>) => Block;

let currentInstance: VaporInstance | null = null;

export function getCurrentInstance(): VaporInstance | null {
    return currentInstance;
}

export function setCurrentInstance(instance: VaporInstance | null): VaporInstance | null {
    const prev = currentInstance;
    currentInstance = instance;
    return prev;
}

/**
 * Stores a template ref on the instance's refs backing store, bypassing the
 * `component.refs` getter (which deliberately returns undefined during render,
 * exactly when applyRefs runs). The backing store lives on the instance so that a
 * later `this.refs` read (post-render) returns it.
 */
export function setInstanceRef(instance: VaporInstance, name: string, el: Element): void {
    let store = instance.refsStore;
    if (!store) {
        store = instance.refsStore = {};
    }
    store[name] = el;
    // Invalidate the frozen snapshot so the next `this.refs` read rebuilds it.
    instance.refsFrozen = undefined;
    instance.refsTemplateDeclared = true;
    // Engine-core rebuilds the entire ref set every render, so refs behind an
    // inactive `lwc:if` branch (or a previous template) vanish automatically.
    // Vapor is fine-grained: a branch re-render goes through DynamicFragment's own
    // EffectScope, NOT a full renderInstance (which is the only place refsStore is
    // cleared). Tie this ref's removal to the scope that was active when applyRefs
    // ran — the branch scope for a ref inside an `lwc:if`/`for:each`, or the
    // instance render scope for a top-level ref. When that scope tears down, drop
    // the ref so a stale element from an inactive branch isn't returned.
    onScopeDispose(() => {
        // Only delete if still pointing at THIS element (a re-render may have
        // already overwritten it with the new branch's element).
        if (instance.refsStore && instance.refsStore[name] === el) {
            delete instance.refsStore[name];
            instance.refsFrozen = undefined;
        }
    });
}
