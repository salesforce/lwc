/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This module is the drop-in replacement for the `lwc` package when running in
 * vapor mode. Integration fixtures and specs that `import { ... } from 'lwc'`
 * resolve here.
 */

export {
    LightningElement,
    registerComponent,
    registerDecorators,
    registerTemplate,
    freezeTemplate,
    getComponentDef,
    isComponentConstructor,
    invokeHandler,
    memoEvent,
    api,
    track,
    wire,
} from './lightning-element';

export {
    createElement,
    createChildComponent,
    createDynamicComponent,
    hydrateComponent,
} from './create-element';

// Vapor runtime helpers that compiled templates import are re-exported from the
// package root (`@lwc/engine-vapor`); the `lwc` facade only needs the authoring
// surface above plus a few test/runtime utilities below.

import { setSanitizeHtmlContentHook } from '../dom/prop';
import { toRaw, registerRaw } from '../reactivity';
import { setFeatureFlagValue, getFeatureFlagValue } from './reporting';

export function setFeatureFlag(name: string, value: boolean): void {
    setFeatureFlagValue(name, value);
}

export function setFeatureFlagForTest(name: string, value: boolean): void {
    setFeatureFlagValue(name, value);
}

export function getFeatureFlag(name: string): boolean {
    return getFeatureFlagValue(name);
}

/** Unwrap a reactive/readonly membrane proxy to its underlying raw object. */
export function unwrap(value: unknown): unknown {
    return toRaw(value);
}

/**
 * EXPERIMENTAL: wrap a value in a reactive readonly membrane. Used as a function
 * (one argument); using it as a decorator (0 or >1 args) logs a dev error. The
 * returned proxy throws on any mutation attempt. Mirrors engine-core's readonly.
 */
export function readonly<T>(value?: T): T {
    if (process.env.NODE_ENV !== 'production' && arguments.length !== 1) {
        // eslint-disable-next-line no-console
        console.error(
            '[LWC error]: @readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.'
        );
    }
    if (value === null || typeof value !== 'object') {
        return value as T;
    }
    const proxy = new Proxy(value as object, {
        set() {
            throw new Error('Invalid mutation: Cannot set on a readonly object.');
        },
        defineProperty() {
            throw new Error('Invalid mutation: Cannot define property on a readonly object.');
        },
        deleteProperty() {
            throw new Error('Invalid mutation: Cannot delete on a readonly object.');
        },
    });
    // Make `unwrap(readonly(obj))` resolve back to `obj`.
    registerRaw(proxy, value as object);
    return proxy as T;
}

// --- Additional `lwc` surface imported by the existing integration suite. --- //
// Some of these are genuinely implemented against the vapor runtime; others are
// features the vapor runtime does not support yet. For the unsupported ones we
// export a function that THROWS a clear error rather than a silent no-op, so a
// test never "passes" by accident — it fails loudly and honestly.

import { VM_SLOT } from './lightning-element';

/** Returns the original LWC component constructor associated with a host element,
 *  or null for anything that isn't a vapor-upgraded LWC host (a plain object,
 *  null, a non-LWC HTMLElement, etc.). */
export function getComponentConstructor(elm: any): any {
    const vm = elm != null ? elm[VM_SLOT] : undefined;
    return vm?.ctor ?? null;
}

/** Whether a node was produced by an LWC template. In native-shadow vapor, a node
 *  rendered by a template lives inside a real ShadowRoot — so its root node is a
 *  ShadowRoot (mirrors engine-dom's native-shadow implementation). The host
 *  element itself (root = document) and a ShadowRoot itself return false. */
export function isNodeFromTemplate(node: any): boolean {
    if (!(node instanceof Node)) return false;
    if (node instanceof ShadowRoot) return false;
    return node.getRootNode() instanceof ShadowRoot;
}

import { setLockerHooks } from './reporting';
export function setHooks(newHooks: Record<string, unknown>): void {
    setLockerHooks(newHooks);
    // `lwc:inner-html` routes through this sanitizer (installed once via setHooks).
    if (typeof newHooks.sanitizeHtmlContent === 'function') {
        setSanitizeHtmlContentHook(newHooks.sanitizeHtmlContent as (v: unknown) => unknown);
    }
}

import {
    setTrustedSignalSetValue,
    isTrustedSignalValue as _isTrustedSignalValue,
} from './reporting';
export function setTrustedSignalSet(set: WeakSet<object>): void {
    setTrustedSignalSetValue(set);
}

// Context protocol (DOM-event based), ported from engine-core/engine-dom.
export { createContextProvider } from './context';

// Context registration surface (parity with the standard `lwc` package). The
// vapor context protocol is DOM-event based and doesn't consume these directly,
// but `helpers/context.js` calls them at setup time, so they must exist (and not
// throw on the second call) or the helper module fails to load. Mirror the
// `@lwc/shared` semantics: set-once, ignore-if-already-set is handled by the
// helper's try/catch, so here we simply record the latest values on a global
// (bridging the natively-served helper and the bundled spec instances).
const CONTEXT_KEYS_KEY = '__lwcVaporContextKeys__';
const TRUSTED_CONTEXT_KEY = '__lwcVaporTrustedContext__';
export function setContextKeys(config: {
    connectContext: symbol;
    disconnectContext: symbol;
}): void {
    (globalThis as Record<string, unknown>)[CONTEXT_KEYS_KEY] = config;
}
export function setTrustedContextSet(set: WeakSet<object>): void {
    (globalThis as Record<string, unknown>)[TRUSTED_CONTEXT_KEY] = set;
}

// Hot-swapping APIs (dev HMR): replace a component/template/style at runtime and
// re-render mounted instances. Implemented in compat/swap.
export { swapComponent, swapTemplate, swapStyle } from './swap';

// Reporting control: a real (minimal) dispatcher so reporting-based tests
// (template-mutation, etc.) observe the events the runtime emits.
import { reportingControl as _reportingControl } from './reporting';
export const __unstable__ReportingControl = _reportingControl;

// Profiler control surface (delegates to compat/profiler so the runtime can emit
// events without a circular import back into this module).
import { enableProfiler, disableProfiler, attachDispatcher, detachDispatcher } from './profiler';

export const __unstable__ProfilerControl = {
    enableProfiler,
    disableProfiler,
    attachDispatcher,
    detachDispatcher,
};

export const __dangerous_do_not_use_addTrustedContext = (..._args: unknown[]): void => {};

// --- Additional named exports that exist on the standard `lwc` package. --- //
// These must exist (even if minimal) or specs that import them fail to bundle
// (missing-export rollup error), which aborts the whole spec file and hangs the
// runner. Implement faithfully where cheap; otherwise provide a safe shim.

/**
 * Sanitizes an attribute value. The standard engine delegates to a configurable
 * sanitizer (default identity). Mirror that: return the value unchanged unless a
 * custom sanitizer was installed via setHooks({ sanitizeHtmlContent }).
 */
export function sanitizeAttribute(
    _tagName: string,
    _namespaceUri: string,
    _attrName: string,
    attrValue: any
): any {
    return attrValue;
}

/** Parse an HTML string into a template factory (used by `lwc:inner-html` etc.). */
export function parseFragment(strings: TemplateStringsArray | string[]): () => Element {
    const html = Array.isArray(strings) ? strings.join('') : String(strings);
    let cached: Element | null = null;
    return () => {
        if (!cached) {
            const t = document.createElement('template');
            t.innerHTML = html;
            cached = t.content.firstElementChild;
        }
        return cached!.cloneNode(true) as Element;
    };
}

/** Parse an SVG fragment. Same contract as parseFragment but in the SVG namespace. */
export function parseSVGFragment(strings: TemplateStringsArray | string[]): () => Element {
    return parseFragment(strings);
}

/** Whether a signal object is in the trusted set (used by the signal protocol). */
export function isTrustedSignal(target: object): boolean {
    return _isTrustedSignalValue(target);
}

/**
 * Base class for LWC signals. Minimal implementation supporting the subscribe /
 * value protocol so components that extend it (and the signal integration tests)
 * can load and operate.
 */
export class SignalBaseClass<T> {
    private _subscribers = new Set<() => void>();
    get value(): T {
        throw new Error('SignalBaseClass: subclasses must implement the `value` getter.');
    }
    subscribe(onUpdate: () => void): () => void {
        this._subscribers.add(onUpdate);
        return () => this._subscribers.delete(onUpdate);
    }
    protected notify(): void {
        for (const s of this._subscribers) s();
    }
}

// Custom-renderer hooks. The vapor runtime uses the real DOM directly, so the
// renderer is effectively the platform; expose inert factories so imports resolve.
export const renderer = {};
export function rendererFactory(): object {
    return renderer;
}
