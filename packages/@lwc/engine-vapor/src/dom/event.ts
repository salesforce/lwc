/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { onScopeDispose } from '../block';
import { toRaw, trackEpoch } from '../reactivity';

type EventHandler = (e: Event) => any;

const delegatedEvents: Record<string, boolean> = Object.create(null);

// Events that do NOT cross shadow-DOM boundaries (composed === false). They bubble
// WITHIN the tree that contains the target but never reach a `document`-level
// delegated listener when the target is inside a shadow root — so document
// delegation misses them. For these we register the delegated listener on each
// containing ROOT NODE (the shadow root, or document for light DOM) instead.
// (Composed events like `click`/`input` DO reach document, so they stay there.)
// List mirrors the DOM spec's non-composed UI/form events LWC templates bind.
const NON_COMPOSED_EVENTS = new Set([
    'change',
    'reset',
    'select',
    'toggle',
    'load',
    'error',
    'abort',
    'scroll',
    // focus/blur are non-composed but their composed variants (focusin/focusout)
    // are what bubble; `focus`/`blur` don't bubble at all, so delegation can't
    // observe them regardless — omitted (a direct `on(...)` binding is required).
]);

export function on(
    el: Element,
    event: string,
    handler: EventHandler,
    options?: AddEventListenerOptions
): void {
    el.addEventListener(event, handler, options);
    onScopeDispose(() => {
        // `slotchange` on a native `<slot>` is fired by the browser at the MICROTASK
        // checkpoint AFTER the slot element is (synchronously) removed from the DOM —
        // removing a `<slot>` that had assigned nodes signals a slot change (engine-core
        // relies on this in native shadow; see rendering.ts "Only required for synthetic
        // shadow"). Scope teardown runs this disposer SYNCHRONOUSLY, BEFORE that queued
        // microtask, so removing the listener here would drop the pending slotchange and
        // the `onslotchange` handler on a conditionally-removed `<slot>` would never fire
        // (HTMLSlotElement.slotchange "should fire slotchange when slot is removed").
        // Defer the removal to a macrotask so the browser's queued slotchange microtask
        // dispatches first while the listener is still live; the detached slot is GC-safe
        // either way (engine-core never removes template-bound listeners on unmount).
        if (event === 'slotchange') {
            setTimeout(() => {
                el.removeEventListener(event, handler, options);
            });
            return;
        }
        el.removeEventListener(event, handler, options);
    });
}

export function delegate(el: any, event: string, handler: EventHandler): void {
    el[`$evt${event}`] = handler;
    // For a non-composed event, the `document`-level delegated listener installed by
    // delegateEvents never sees it when `el` is inside a shadow root (the event
    // doesn't cross the boundary). Ensure the containing ROOT NODE has its own
    // delegated listener so the event is still observed (events/memoization onChange
    // on an <input> in a child's shadow root). Idempotent per (root, event).
    if (NON_COMPOSED_EVENTS.has(event) && !el[`$evtDirect${event}`]) {
        // A non-composed event never reaches the `document`-level delegated listener
        // from inside a shadow root. Delegating at the element's root node fails too:
        // at mount time the element lives in a detached DocumentFragment (moved into
        // the real shadow root later), so a root-node listener would attach to the
        // discarded fragment. Bind DIRECTLY on the element instead — the handler
        // stored in `$evt<event>` is dispatched via the same walk-up logic, so
        // ancestor handlers within the tree still run (events/memoization onChange).
        el[`$evtDirect${event}`] = true;
        el.addEventListener(event, directDelegatedHandler);
    }
}

// Handler for a DIRECTLY-bound non-composed event: fire ONLY this element's own
// `$evt<type>` handler(s). Unlike `delegatedEventHandler` it does NOT walk up — the
// event bubbles natively within the tree, so an ancestor with its own direct
// listener fires on its own turn (walking up here would double-invoke ancestors).
function directDelegatedHandler(this: any, e: Event): void {
    const handler = this[`$evt${e.type}`] as EventHandler | EventHandler[] | undefined;
    if (!handler) return;
    if (Array.isArray(handler)) {
        for (const h of handler) {
            h(e);
            if (e.cancelBubble) return;
        }
    } else {
        handler(e);
    }
}

/**
 * `lwc:on={obj}` — bind each own-enumerable property of `obj` as an event
 * listener, where the property name is the event type and the value is the
 * handler. Non-function values are reported as a dev error (matching engine-core)
 * and skipped. Listeners are scope-managed so they're removed on teardown.
 */
interface LwcOnState {
    obj: Record<string, unknown> | null | undefined;
    // Per event: the original handler (for mutation detection) + the bound
    // listener actually attached (for removal).
    listeners: Map<string, { original: unknown; attached: EventHandler }>;
    // Clone of the object's own-enumerable key→value pairs at the last render,
    // used to detect in-place mutation of the SAME object reference next render.
    snapshot?: Record<string, unknown>;
}
const lwcOnStates = new WeakMap<Element, LwcOnState>();

/**
 * `lwc:on={obj}` — attach each property of `obj` as an event listener (key =
 * event type, value = handler), bound to the owner component. Re-invoked on every
 * render of the host: it diffs against the previously-applied object and
 * adds/removes/updates listeners accordingly. Reusing the SAME object reference
 * with mutated properties is prohibited (engine-core throws) — detected here.
 */
export function spreadEvents(
    el: Element,
    obj: Record<string, unknown> | null | undefined,
    owner?: unknown
): void {
    const prev = lwcOnStates.get(el);
    const nextListeners = new Map<string, { original: unknown; attached: EventHandler }>();
    const tag = el.tagName.toLowerCase();

    // `lwc:on` is re-evaluated on EVERY render of the owner in LWC. Vapor effects
    // only re-run on tracked deps, and the lwc:on expression may read no reactive
    // field at all (e.g. a getter returning a module-level object). Subscribe to
    // the owner's render-epoch so this effect re-runs whenever ANY owner field
    // changes — which is what lets in-place mutation of the same object be detected.
    if (owner != null) {
        trackEpoch(toRaw(owner) as object);
    }

    // Compare by RAW identity: a reactive field getter returns a fresh deepReactive
    // proxy each render wrapping the same underlying object, so `prev.obj === obj`
    // would never hold for a reused-and-mutated object. `toRaw` unwraps to the
    // stable underlying reference used both for the same-object check and the
    // mutation diff below.
    const rawObj = obj != null ? toRaw(obj) : obj;
    const newObj = obj != null && typeof obj === 'object' ? obj : null;

    // Immutability check: reusing the SAME object reference with any added,
    // modified, or deleted property is prohibited (engine-core diffs a per-render
    // CLONE against the previous clone while comparing the raw reference for
    // sameness — so an in-place mutation of the same object is detected). We mirror
    // that: `prev.snapshot` is the previous render's key→handler clone.
    if (prev && prev.obj === rawObj && obj != null) {
        const snapshot = prev.snapshot ?? {};
        // Added or modified own-enumerable properties.
        for (const event of Object.keys(obj)) {
            const cur = (obj as Record<string, unknown>)[event];
            if (!(event in snapshot) || snapshot[event] !== cur) {
                logLwcOnError(
                    `Detected mutation of property '${event}' in the object passed to lwc:on for <${tag}>. ` +
                        `Reusing the same object with modified properties is prohibited. Please pass a new object instead.`
                );
            }
        }
        // Deleted properties.
        for (const event of Object.keys(snapshot)) {
            if (!Object.prototype.hasOwnProperty.call(obj, event)) {
                logLwcOnError(
                    `Detected mutation of property '${event}' in the object passed to lwc:on for <${tag}>. ` +
                        `Reusing the same object with modified properties is prohibited. Please pass a new object instead.`
                );
            }
        }
    }

    // Remove listeners that are gone or whose handler changed.
    if (prev) {
        for (const [event, { attached, original }] of prev.listeners) {
            const next = newObj ? (newObj as Record<string, unknown>)[event] : undefined;
            if (!newObj || next !== original || prev.obj !== rawObj) {
                el.removeEventListener(event, attached);
            }
        }
    }

    // Snapshot the object's own-enumerable key→value pairs for next render's diff.
    const snapshot: Record<string, unknown> = {};

    if (newObj) {
        for (const event of Object.keys(newObj)) {
            const handler = (newObj as Record<string, unknown>)[event];
            snapshot[event] = handler;
            // Reuse the existing attached listener if the same object + same handler.
            const existed = prev?.listeners.get(event);
            if (prev && prev.obj === rawObj && existed && existed.original === handler) {
                nextListeners.set(event, existed);
                continue;
            }
            // A non-function handler is still "attached" via a wrapper that throws
            // an assertion when the event fires (matching engine-core, which
            // validates the handler at invocation time, not at attach time).
            const bound: EventHandler = (event_: Event) => {
                if (typeof handler !== 'function') {
                    throw new Error(
                        `Assert Violation: Invalid event handler for event '${event_.type}' on <${tag}>.`
                    );
                }
                return owner !== undefined
                    ? (handler as EventHandler).call(owner, event_)
                    : (handler as EventHandler)(event_);
            };
            el.addEventListener(event, bound);
            nextListeners.set(event, { original: handler, attached: bound });
        }
    }

    lwcOnStates.set(el, { obj: rawObj, listeners: nextListeners, snapshot });
    onScopeDispose(() => {
        const state = lwcOnStates.get(el);
        if (state) {
            for (const [event, { attached }] of state.listeners) {
                el.removeEventListener(event, attached);
            }
            lwcOnStates.delete(el);
        }
    });
}

function logLwcOnError(message: string): void {
    try {
        throw new Error(`[LWC error]: ${message}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

export function delegateEvents(...names: string[]): void {
    for (const name of names) {
        // Non-composed events are delegated at the containing ROOT NODE by
        // `delegate` (a document listener never sees them from inside a shadow
        // root, and would DOUBLE-fire for light DOM where they do reach document).
        if (NON_COMPOSED_EVENTS.has(name)) continue;
        if (!delegatedEvents[name]) {
            delegatedEvents[name] = true;
            document.addEventListener(name, delegatedEventHandler);
        }
    }
}

function delegatedEventHandler(e: Event): void {
    let node = (e.composedPath?.()[0] || e.target) as any;
    const type = e.type;

    // Vapor invokes template-bound handlers MANUALLY from a single `document`-level
    // listener, so the native `event.currentTarget` is `document` for the whole walk —
    // not the element the handler was bound to (`onclick={h}` on a <tr>). Classic LWC
    // binds via native `addEventListener` on the element, so the browser reports
    // `currentTarget` as that element. Mirror that: expose `currentTarget` as the node
    // whose handler is currently running, restoring the native behaviour afterwards
    // (native events report `currentTarget === null` outside active dispatch). Note
    // `Event.currentTarget` is a getter-only accessor inherited from `Event.prototype`,
    // so it must be shadowed with an own property via `defineProperty`, not assigned.
    let currentTarget: any = null;
    const originalDescriptor = Object.getOwnPropertyDescriptor(e, 'currentTarget');
    Object.defineProperty(e, 'currentTarget', {
        configurable: true,
        get: () => currentTarget,
    });

    try {
        while (node !== null) {
            const handler = node[`$evt${type}`] as EventHandler | EventHandler[] | undefined;
            if (handler) {
                currentTarget = node;
                if (Array.isArray(handler)) {
                    for (const h of handler) {
                        h(e);
                        if (e.cancelBubble) return;
                    }
                } else {
                    handler(e);
                    if (e.cancelBubble) return;
                }
            }
            // Walk up, respecting shadow DOM boundaries
            node =
                node.host && node.host !== node && node.host instanceof Node
                    ? node.host
                    : node.parentNode;
        }
    } finally {
        // Remove our override so `currentTarget` reads back through the native getter
        // (which is `null` now that dispatch has finished). The `finally` also covers
        // the `cancelBubble` early-returns above and any handler that throws.
        delete (e as any).currentTarget;
        if (originalDescriptor) {
            Object.defineProperty(e, 'currentTarget', originalDescriptor);
        }
    }
}
