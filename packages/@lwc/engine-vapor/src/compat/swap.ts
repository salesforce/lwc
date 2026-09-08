/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Hot-swap support (dev-only HMR): swapComponent/swapTemplate/swapStyle replace a
 * component constructor, template render fn, or stylesheet at runtime and
 * re-render all mounted instances that depend on it. Resolution maps are applied
 * when an instance resolves its ctor/template/stylesheets.
 */

import type { VaporInstance } from './lightning-element';

// old -> new resolution maps. Chained lookups collapse to the final target.
const ctorSwaps = new Map<unknown, unknown>();
const templateSwaps = new Map<unknown, unknown>();
const styleSwaps = new Map<unknown, unknown>();

// Test harness reset hooks (helpers/reset.js calls these between tests).
if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, unknown>).__lwcResetHotSwaps = () => {
        ctorSwaps.clear();
        templateSwaps.clear();
        styleSwaps.clear();
    };
    // Vapor injects stylesheets per-instance (no shared cache to clear); the hook
    // must exist so resetHotSwaps() doesn't throw.
    if (!(globalThis as Record<string, unknown>).__lwcResetStylesheetCache) {
        (globalThis as Record<string, unknown>).__lwcResetStylesheetCache = () => {};
    }
}

// Live registry of mounted instances, plus which ctor/template/styles each uses,
// so a swap can find and re-render the affected ones.
const mountedInstances = new Set<VaporInstance>();

export function registerMounted(instance: VaporInstance): void {
    mountedInstances.add(instance);
}
export function unregisterMounted(instance: VaporInstance): void {
    mountedInstances.delete(instance);
}

function resolveChain(map: Map<unknown, unknown>, value: unknown): unknown {
    let v = value;
    const seen = new Set<unknown>();
    while (map.has(v) && !seen.has(v)) {
        seen.add(v);
        v = map.get(v);
    }
    return v;
}

/** Resolve a constructor through the swap map (final target). */
export function resolveCtor(ctor: unknown): unknown {
    return resolveChain(ctorSwaps, ctor);
}
/** Resolve a template render fn through the swap map. */
export function resolveTemplate(tmpl: unknown): unknown {
    return resolveChain(templateSwaps, tmpl);
}
/** Resolve a stylesheet factory through the swap map. */
export function resolveStyle(style: unknown): unknown {
    return resolveChain(styleSwaps, style);
}

function isComponentCtor(ctor: unknown, isComponentConstructor: (c: any) => boolean): boolean {
    return typeof ctor === 'function' && isComponentConstructor(ctor);
}

// The reRender callback is injected by lightning-element to avoid a circular import.
let reRenderInstance: ((i: VaporInstance) => void) | null = null;
export function setReRenderInstance(fn: (i: VaporInstance) => void): void {
    reRenderInstance = fn;
}

let isComponentConstructorFn: (c: any) => boolean = () => false;
export function setIsComponentConstructor(fn: (c: any) => boolean): void {
    isComponentConstructorFn = fn;
}

function rerenderWhere(predicate: (i: VaporInstance) => boolean): void {
    for (const instance of mountedInstances) {
        if (instance.isMounted && predicate(instance) && reRenderInstance) {
            reRenderInstance(instance);
        }
    }
}

export function swapComponent(oldC: unknown, newC: unknown): boolean {
    // Match engine-core (hot-swaps.ts): throw only when EXACTLY ONE arg is a
    // component; when BOTH are non-components it's a no-op returning false.
    const oldIsC = isComponentCtor(oldC, isComponentConstructorFn);
    const newIsC = isComponentCtor(newC, isComponentConstructorFn);
    if (!oldIsC && !newIsC) {
        return false;
    }
    if (!oldIsC && newIsC) {
        throw new TypeError(
            'Invalid Component: Attempting to swap a non-component with a component.'
        );
    }
    if (oldIsC && !newIsC) {
        throw new TypeError(
            'Invalid Component: Attempting to swap a component with a non-component.'
        );
    }
    // A component used as a ROOT element (createElement, no parent) cannot be
    // hot-swapped (the page must reload) — return false in that case. Otherwise
    // record the swap, re-render existing non-root usages, and return true.
    let hasRoot = false;
    let hasNonRoot = false;
    for (const i of mountedInstances) {
        if (i.isMounted && i.ctor === oldC) {
            if (i.parent) hasNonRoot = true;
            else hasRoot = true;
        }
    }
    if (hasRoot && !hasNonRoot) {
        return false;
    }
    ctorSwaps.set(oldC, newC);
    // Re-render the PARENTS of instances using the old ctor: re-running the
    // parent's template calls createChildComponent again, which resolves the old
    // ctor to the new one and recreates the child host with the new definition.
    const parents = new Set<VaporInstance>();
    for (const i of mountedInstances) {
        if (i.isMounted && i.ctor === oldC && i.parent) parents.add(i.parent);
    }
    for (const p of parents) {
        if (reRenderInstance) reRenderInstance(p);
    }
    return true;
}

/** A compiled template is a function branded by registerTemplate/freezeTemplate. */
function isCompiledTemplate(t: unknown): boolean {
    return (
        typeof t === 'function' &&
        (t as unknown as Record<string, unknown>).__lwcVaporTemplate__ === true
    );
}

export function swapTemplate(oldT: unknown, newT: unknown): boolean {
    if (!isCompiledTemplate(oldT) || !isCompiledTemplate(newT)) {
        throw new TypeError('Invalid Template: both arguments must be templates.');
    }
    templateSwaps.set(oldT, newT);
    rerenderWhere((i) => resolveTemplate(i.renderFn) === resolveTemplate(newT));
    return true;
}

export function swapStyle(oldS: unknown, newS: unknown): boolean {
    if (typeof oldS !== 'function' || typeof newS !== 'function') {
        throw new TypeError('Invalid Style: both arguments must be stylesheets.');
    }
    styleSwaps.set(oldS, newS);
    // Re-render all mounted instances; stylesheet resolution picks up the new one.
    rerenderWhere(() => true);
    return true;
}
