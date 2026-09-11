/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { notifySlotAttrChanged } from '../slot';

type TargetElement = HTMLElement & {
    $txt?: string;
    $cls?: string;
    [key: `$${string}`]: any;
};

export function setText(el: Text, value: unknown): void {
    // Coerce to a string the way LWC template interpolation does: null/undefined
    // render as empty, everything else via String().
    const str = value == null ? '' : String(value);
    const castEl = el as Text & { $txt?: string };
    if (castEl.$txt !== str) {
        castEl.nodeValue = castEl.$txt = str;
    }
}

export function setAttr(el: Element, key: string, value: any): void {
    const castEl = el as any;
    const cacheKey = `$${key}`;
    if (value !== castEl[cacheKey]) {
        castEl[cacheKey] = value;
        if (value != null && value !== false) {
            el.setAttribute(key, value === true ? '' : String(value));
        } else {
            el.removeAttribute(key);
        }
    }
}

export function setClass(el: Element, value: any): void {
    const castEl = el as TargetElement & {
        $clsTokens?: Set<string>;
        $clsObjKeys?: string[];
        $clsRaw?: unknown;
    };
    // Fast path for STRING class bindings (the common case — incl. the krausest
    // `className` getter): an unchanged string yields an identical token set, so the
    // tokenize+diff below is a pure no-op. Skipping it is what makes it SAFE to fold
    // this binding into a shared renderEffect with sibling bindings (compiler effect-
    // batching): when an unrelated dep changes and re-runs the merged effect, an
    // unchanged class value must NOT re-walk/re-add its tokens. Only strings are fast-
    // pathed — a reactive class OBJECT/ARRAY can mutate in place at the SAME reference,
    // so it must always re-evaluate. This matches engine-core (an unchanged class string
    // produces an empty diff → no DOM ops) and Vue vapor's `$cls` value cache.
    if (typeof value === 'string' && value === castEl.$clsRaw) {
        return;
    }
    // Record the last-applied value for the fast path above. A non-string (object/
    // array) render clears it to `undefined` so a subsequent string can never falsely
    // match a stale prior string (e.g. "a" → {…} → "a" must re-apply, not skip).
    castEl.$clsRaw = typeof value === 'string' ? value : undefined;
    // EMPTY-STRING fast path (the krausest MOUNT default: no row selected → the
    // `className` getter returns "" for every row). The full path below would allocate
    // an empty token `Set` + run the tokenizer regex/split per row purely to produce
    // nothing — real per-row work (a Set is a hash-table alloc, unlike a bump-allocated
    // plain object) paid 10k times at create-10k. Short-circuit it: there are no tokens
    // to add, so just remove any PREVIOUSLY-bound tokens (a 'danger' → '' deselect) and
    // reuse the existing Set. First mount has no prior tokens ($clsTokens undefined) →
    // pure no-op. Behavior-identical to the full path (empty `next` diffed against prev).
    if (value === '') {
        const prevTokens = castEl.$clsTokens;
        if (prevTokens !== undefined && prevTokens.size > 0) {
            for (const tok of prevTokens) el.classList.remove(tok);
            prevTokens.clear();
        }
        return;
    }
    // `class={obj}` where `obj` is a PLAIN object (not string/array): engine-core
    // SNAPSHOTS the object's keys at the FIRST render and only ever toggles THOSE
    // keys on subsequent renders — a property added later is IGNORED (api>=62
    // object-class-binding; template/attribute-class "ignores newly added
    // properties"). Restrict consideration to the first-seen key set.
    let classValue = value;
    if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        typeof value !== 'string'
    ) {
        if (castEl.$clsObjKeys === undefined) {
            castEl.$clsObjKeys = Object.keys(value);
        }
        const snapshot: Record<string, unknown> = {};
        for (const k of castEl.$clsObjKeys) snapshot[k] = (value as Record<string, unknown>)[k];
        classValue = snapshot;
    }
    // Tokenize + dedup the bound class value into a stable set.
    const next = new Set<string>();
    for (const tok of normalizeClass(classValue).split(/\s+/)) {
        if (tok) next.add(tok);
    }
    // Diff against the PREVIOUSLY-bound token set (not the live classList), so
    // classes added imperatively (`el.classList.add(...)` outside the binding) are
    // preserved across updates — matching engine-core's class module.
    const prev = castEl.$clsTokens;
    if (prev) {
        for (const tok of prev) {
            if (!next.has(tok)) el.classList.remove(tok);
        }
    }
    for (const tok of next) el.classList.add(tok);
    castEl.$clsTokens = next;
}

export function setStyle(el: HTMLElement, value: any): void {
    const castEl = el as HTMLElement & { $sty?: string | null };
    if (typeof value === 'string') {
        // Memoize the last-applied style string. An unchanged value is a no-op, which
        // (like setText/setAttr/setClass) makes this binding SAFE to fold into a shared
        // renderEffect via compiler effect-batching: re-running the merged effect for an
        // unrelated dep change must not re-write an unchanged `style`. `''` and a real
        // string are distinct cache states, so a real→'' transition still removes the
        // attribute. Matches engine-core (unchanged style → no DOM op) + Vue's `$sty`.
        if (castEl.$sty === value) {
            return;
        }
        castEl.$sty = value;
        if (value === '') {
            el.removeAttribute('style');
        } else {
            // Set the `style` ATTRIBUTE directly (not `el.style.cssText`, which
            // re-serializes and e.g. inserts a space after the colon in CSS custom
            // properties: `--x:blue;` → `--x: blue;`). LWC preserves the authored
            // string verbatim in the attribute.
            el.setAttribute('style', value);
        }
        return;
    }
    if (value == null) {
        // Cache the removed state (null) so a repeated null render is a no-op but a
        // subsequent string still writes (null !== string).
        if (castEl.$sty !== null) {
            castEl.$sty = null;
            el.removeAttribute('style');
        }
        return;
    }
    // The `style` attribute only accepts string values in LWC. Anything else is
    // ignored with a dev warning (matching engine-core's behavior).
    const tag = el.tagName.toLowerCase();
    try {
        throw new Error(
            `[LWC error]: Invalid 'style' attribute passed to <${tag}> is ignored. This attribute must be a string value.`
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

export function setProp(el: any, key: string, value: any): void {
    // `slot={expr}` is always an ATTRIBUTE; a change (a parent reassigning a
    // forwarded child's slot) must notify the light-DOM slot REORDER so the terminal
    // component regroups its children by slot name (multi-level forwarding, where
    // intermediate fragments were flattened and can't relocate the node). Handled at
    // the top so it's independent of element type.
    if (key === 'slot') {
        // A `slot={expr}` binding that resolves to the EMPTY STRING keeps `slot=""`
        // present (api>=61 light-DOM slot forwarding: an empty forward target marks the
        // node/`<slot>` as distributed-via-forwarding, not un-slotted). Only a
        // null/undefined value removes the attribute entirely.
        const cur = value == null ? null : String(value);
        if ((el as any).$slot !== cur) {
            (el as any).$slot = cur;
            if (cur === null) el.removeAttribute?.('slot');
            else el.setAttribute?.('slot', cur);
            notifySlotAttrChanged();
        }
        return;
    }
    // `innerHTML`/`outerHTML` cannot be set via a normal property binding — they'd
    // clobber rendered content / bypass sanitization. engine-core's safelySetProperty
    // logs a dev warning and SKIPS the assignment (unless the value is undefined,
    // which is inherently safe). Use `lwc:inner-html` / `lwc:dom-manual` instead.
    if ((key === 'innerHTML' || key === 'outerHTML') && value !== undefined) {
        if (process.env.NODE_ENV !== 'production') {
            try {
                throw new Error(
                    `[LWC warn]: Cannot set property "${key}". Instead, use lwc:inner-html or lwc:dom-manual.`
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(e);
            }
        }
        return;
    }
    // tabindex in a template only accepts 0 or -1; a value > 0 is normalized to 0
    // (and a dev error logged), matching engine-core's `ti()`. Booleans pass
    // through. This rewrites `value` so the normalized 0 is what reflects.
    if ((key === 'tabindex' || key === 'tabIndex') && value != null) {
        const shouldNormalize = value > 0 && value !== true && value !== false;
        if (shouldNormalize) {
            const tag = (el.tagName ?? '').toLowerCase();
            try {
                throw new Error(
                    `[LWC error]: Invalid tabindex value \`${value}\` in template for <${tag}>. This attribute must be set to 0 or -1.`
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
            value = 0;
        }
    }
    // Live-binding form props (`value`/`checked` on input/textarea/select/option):
    // engine-core assigns them RAW as a property every render (isLiveBindingProp),
    // never through the attribute or the null-removal path, and WITHOUT an equality
    // guard — so the binding re-asserts the bound value over a user-mutated live DOM
    // value (input "use the DOM value for diffing"). `value={undefined}` renders the
    // literal "undefined" (engine-core does `el.value = undefined`), not a removed
    // attribute.
    const tagL = typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
    if (
        (key === 'value' || key === 'checked') &&
        (tagL === 'input' || tagL === 'textarea' || tagL === 'select' || tagL === 'option')
    ) {
        try {
            el[key] = value;
        } catch {
            /* read-only in some states */
        }
        return;
    }
    // `id` on a CUSTOM element is set as a raw property (engine-core routes `id`
    // through props for custom elements): `id={undefined}` → `el.id = undefined` →
    // the attribute renders the literal "undefined" (must run BEFORE the null-removal
    // below); `id={''}` → "". Native elements keep attribute semantics (handled after
    // the null check, where `id={undefined}` correctly removes → null).
    if (key === 'id' && typeof el.tagName === 'string' && el.tagName.includes('-')) {
        el.id = value;
        return;
    }
    // Null/undefined removes the attribute rather than stringifying into a DOM
    // property (setting `el.title = null` would render the literal "null").
    if (value == null) {
        // Custom-element (declared public prop): assign the null/undefined property
        // WITHOUT reading the getter to test its type. Reading `el[key]` would invoke
        // the component's user `get` accessor as a side effect (scheduled-rehydration
        // counts getter calls). Diff against the cached last-set value instead.
        if (key in el && typeof el.tagName === 'string' && el.tagName.includes('-')) {
            const cache = (el.$$lwcPropCache ??= Object.create(null));
            const had = key in cache;
            if (!had || cache[key] !== value) {
                try {
                    el[key] = value;
                } catch {
                    /* read-only */
                }
                cache[key] = value;
            }
            el.removeAttribute?.(key);
            const cacheKey = `$${key}`;
            if (cacheKey in el) (el as any)[cacheKey] = value;
            return;
        }
        if (key in el && typeof el[key] !== 'string') {
            // Reset non-string props to their default-ish empty value.
            try {
                el[key] = value;
            } catch {
                /* read-only */
            }
        }
        el.removeAttribute?.(key);
        const cacheKey = `$${key}`;
        if (cacheKey in el) (el as any)[cacheKey] = value;
        return;
    }
    // Native `id`: set as an ATTRIBUTE with String coercion (no `prev !== value`
    // equality guard — the element's default `id` is already "", so `id={''}` would
    // be skipped by the generic property path and never create the attribute).
    if (key === 'id') {
        setAttr(el, key, String(value));
        return;
    }
    // `spellcheck` / `draggable` are explicit-boolean reflected props: a dynamic
    // template binding (`spellcheck={expr}`) reflects the RAW value to the
    // attribute as a string (e.g. 'truthy' → "truthy", false → "false", 0 → "0"),
    // matching engine-core. Setting the IDL property instead would truthy-coerce
    // ('false' → true) and lose the exact string. Custom elements (declared props)
    // are exempt — those still set the property. (NOTE: this is the DYNAMIC path;
    // STATIC `spellcheck="truthy"` is normalized at compile time to "true".)
    if (
        (key === 'spellcheck' || key === 'draggable') &&
        typeof el.tagName === 'string' &&
        !el.tagName.includes('-')
    ) {
        setAttr(el, key, value === true ? 'true' : value === false ? 'false' : value);
        return;
    }
    // `href` / `xlink:href` are ATTRIBUTE bindings, not IDL-property writes.
    // Two reasons: (1) SVG `<use href={x}>` has a READ-ONLY `SVGAnimatedString`
    // `href` property (assigning throws); (2) for HTML `<a>`/`<area>` the `.href`
    // IDL getter returns `''` (or a resolved absolute URL) even when the attribute
    // is absent, so the generic `key in el` path's `prev !== value` guard wrongly
    // SKIPS setting `href=""` (the IDL value already reads `''`) → the attribute is
    // never created (synthetic-shadow/scoped-id "renders href as expected" for the
    // empty-string case). engine-core routes href through setAttribute (after
    // sanitizeAttribute). Mirror that: always go through the attribute, using the
    // xlink namespace for the legacy `xlink:href`.
    if (key === 'href' || key === 'xlink:href') {
        if (key === 'xlink:href') {
            if (value == null || value === false) {
                el.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
            } else {
                el.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'xlink:href',
                    value === true ? '' : String(value)
                );
            }
        } else {
            setAttr(el, key, value);
        }
        return;
    }
    // Element template bindings (`attr={expr}`) map to the DOM attribute when the
    // name isn't a real DOM property of the element. This matches LWC, where most
    // HTML attribute bindings on plain elements reflect to attributes (e.g.
    // `tabindex`, `title`, `aria-*`, `data-*`). Component props (declared props)
    // are still set as properties (the key exists on the instance).
    if (key in el) {
        // Custom-element (declared public prop): diff against the LAST VALUE WE SET
        // (cached per element+key), NOT the live `el[key]` getter. Reading the getter
        // to diff would invoke the component's user `get` accessor as a side effect of
        // setting — engine-core diffs against the previous vnode's prop value, never the
        // live getter (reactivity/scheduled-rehydration counts getter calls and expects
        // a prop SET to not also READ). Plain elements keep the live read-back (their
        // IDL getters are pure and the read is needed for correct attr/prop diffing).
        if (typeof el.tagName === 'string' && el.tagName.includes('-')) {
            const cache = (el.$$lwcPropCache ??= Object.create(null));
            const had = key in cache;
            const prev = cache[key];
            if (!had || prev !== value) {
                el[key] = value;
                cache[key] = value;
            }
            return;
        }
        const prev = el[key];
        if (prev !== value) {
            el[key] = value;
        }
        return;
    }
    setAttr(el, key, value);
}

// Per-element store of spread-bound event listeners, keyed by event type, so a
// re-render that changes the handler removes the old listener before adding the
// new one (and an unchanged handler is a no-op).
const spreadListeners = new WeakMap<Element, Map<string, EventListener>>();
function applySpreadEventListener(el: Element, type: string, listener: EventListener): void {
    let map = spreadListeners.get(el);
    if (!map) {
        map = new Map();
        spreadListeners.set(el, map);
    }
    const prev = map.get(type);
    if (prev === listener) return;
    if (prev) el.removeEventListener(type, prev);
    el.addEventListener(type, listener);
    map.set(type, listener);
}

export function setDynamicProps(el: Element, props: Record<string, any>): void {
    if (props == null) return;
    for (const key of Object.keys(props)) {
        const value = props[key];
        if (key === 'className') {
            // `lwc:spread` assigns PROPERTIES. `className` is a real DOM string
            // property, so assign it directly (String-coercing) rather than
            // tokenizing — matching engine-core, where spread `{className:
            // undefined}` renders the literal "undefined" and `{className: ''}`
            // clears it. (Authored `class={...}` bindings still use setClass.)
            (el as unknown as { className: string }).className = value as string;
        } else if (key === 'class') {
            setClass(el, value);
        } else if (key === 'style') {
            setStyle(el as HTMLElement, value);
        } else if (key === 'innerHTML' || key === 'outerHTML') {
            // engine-core rejects innerHTML/outerHTML via `lwc:spread` (they would
            // clobber rendered content / lwc:inner-html). Warn and skip. (An element
            // that ALSO has `lwc:inner-html` ends up empty because the compiler skips
            // emitting that directive's SET_HTML when a spread is present — see
            // transform.ts — so there's nothing to clear here.)
            if (process.env.NODE_ENV !== 'production') {
                try {
                    throw new Error(
                        `[LWC warn]: Cannot set property "${key}". Instead, use lwc:inner-html or lwc:dom-manual.`
                    );
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn(e);
                }
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            // `lwc:spread={{ onclick: fn }}` adds an event listener (additive with
            // any template `onclick={...}` — both fire). The event type is the key
            // minus the `on` prefix, lowercased. Track the bound listener per
            // (element, type) so a re-render that changes the handler swaps it
            // rather than stacking duplicates.
            applySpreadEventListener(el, key.slice(2).toLowerCase(), value as EventListener);
        } else if (key in el) {
            setProp(el, key, value);
        } else {
            setAttr(el, key, value);
        }
    }
}

// Convert a kebab-cased attribute name to its camelCased property name (only
// across dashes — `tabindex` stays `tabindex`, NOT `tabIndex`, so it isn't
// treated as the IDL prop). Mirrors @lwc/shared kebabCaseToCamelCase, used by the
// external-element prop/attr heuristic.
function kebabToCamel(attrName: string): string {
    let out = '';
    let i = 0;
    while (i < attrName.length) {
        const ch = attrName[i];
        if (ch === '-' && i + 1 < attrName.length) {
            out += attrName[i + 1].toUpperCase();
            i += 2;
        } else {
            out += ch;
            i += 1;
        }
    }
    return out;
}

function logExternalUnknownPropWarn(el: Element, key: string): void {
    if (process.env.NODE_ENV === 'production') return;
    const tag = el.tagName.toLowerCase();
    try {
        throw new Error(
            `[LWC warn]: Unknown public property "${key}" of element <${tag}>. This is either a typo ` +
                `on the corresponding attribute "${camelToKebabAttr(key)}", or the attribute does not ` +
                `exist in this browser or DOM implementation.`
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
    }
}

function camelToKebabAttr(prop: string): string {
    return prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

/**
 * `lwc:external` element, a single bound attribute (`attr={x}`): engine-core's
 * attrs.ts heuristic — set as a PROPERTY iff its camelCased name exists on the
 * element, else as an attribute (with xml/xlink namespace sniffing for `a:b`/
 * `xlink:b` and null/undefined → removeAttribute).
 */
// Ensure a custom element cloned from a static template is UPGRADED before we
// sniff its properties — a defined-but-not-yet-upgraded element is a plain
// HTMLElement, so `propName in el` would be false and every external prop would
// wrongly fall back to an attribute (or warn as unknown). The browser upgrades on
// connect, but vapor applies external props during render (pre-connect). Mirrors
// engine-core, which patches external attrs after the element is created+defined.
function ensureUpgraded(el: Element): void {
    const tag = el.tagName;
    if (
        typeof customElements === 'undefined' ||
        !tag.includes('-') ||
        !customElements.get(tag.toLowerCase())
    ) {
        return;
    }
    // A node cloned from a `<template>` belongs to that template's inert
    // "contents owner document", which has NO custom-element registry — so
    // `customElements.upgrade` is a no-op there and `prop in el` stays false. Adopt
    // into the MAIN document first, then upgrade. To avoid detaching `el` from its
    // position in vapor's working subtree, adopt the TOPMOST ancestor (adoptNode
    // moves the whole subtree at once; descendants come along). If `el` is itself
    // the root (no parent), adopt it directly.
    try {
        if (el.ownerDocument !== document) {
            let root: Node = el;
            while (root.parentNode) root = root.parentNode;
            document.adoptNode(root);
        }
        customElements.upgrade(el);
    } catch {
        /* ignore */
    }
}

export function setExternalAttr(el: Element, key: string, value: any): void {
    ensureUpgraded(el);
    const propName = kebabToCamel(key);
    if (propName in el) {
        (el as unknown as Record<string, unknown>)[propName] = value;
        return;
    }
    // namespace sniffing (matches engine-core attrs.ts ColonCharCode checks).
    if (key.charCodeAt(3) === 58 /* ':' at index 3 → xml */) {
        if (value == null) el.removeAttribute(key);
        else el.setAttributeNS('http://www.w3.org/XML/1998/namespace', key, String(value));
        return;
    }
    if (key.charCodeAt(5) === 58 /* ':' at index 5 → xlink */) {
        if (value == null) el.removeAttribute(key);
        else el.setAttributeNS('http://www.w3.org/1999/xlink', key, String(value));
        return;
    }
    if (value == null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, String(value));
    }
}

/**
 * `lwc:spread` on an `lwc:external` host: each own key is set as a PROPERTY (with
 * an "Unknown public property" dev warning if it isn't already on the element,
 * matching engine-core's props.ts), EXCEPT class/style/innerHTML which keep their
 * special handling and `on*` functions which add listeners.
 */
const externalSpreadPrev = new WeakMap<Element, Record<string, unknown>>();
export function setExternalDynamicProps(el: Element, props: Record<string, any>): void {
    if (props == null) return;
    ensureUpgraded(el);
    // engine-core's patchProps/patchAttributes only act on a key whose value
    // CHANGED since the last application (the spread effect re-runs every render).
    // Diff against the previously-applied values so the "Unknown public property"
    // warning + the property set fire ONCE per distinct value, not every render.
    const prev = externalSpreadPrev.get(el);
    const snapshot: Record<string, unknown> = {};
    for (const key of Object.keys(props)) {
        const value = props[key];
        snapshot[key] = value;
        const unchanged = prev !== undefined && key in prev && prev[key] === value;
        if (unchanged) continue;
        if (key === 'className') {
            (el as unknown as { className: string }).className = value as string;
        } else if (key === 'class') {
            setClass(el, value);
        } else if (key === 'style') {
            setStyle(el as HTMLElement, value);
        } else if (key === 'innerHTML' || key === 'outerHTML') {
            if (process.env.NODE_ENV !== 'production') {
                try {
                    throw new Error(
                        `[LWC warn]: Cannot set property "${key}". Instead, use lwc:inner-html or lwc:dom-manual.`
                    );
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn(e);
                }
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            applySpreadEventListener(el, key.slice(2).toLowerCase(), value as EventListener);
        } else {
            // engine-core's patchProps: warn if the key isn't a known property of
            // the element, then set it (an expando is created either way).
            if (!(key in el)) {
                logExternalUnknownPropWarn(el, key);
            }
            (el as unknown as Record<string, unknown>)[key] = value;
        }
    }
    externalSpreadPrev.set(el, snapshot);
}

// `lwc:inner-html` content must pass through the installed sanitizer hook
// (setHooks({ sanitizeHtmlContent })) before hitting innerHTML. The cache key is
// the RAW value, so the sanitizer is only re-invoked when the raw bound value
// changes (matching engine-core). The hook is stored on globalThis (not a
// module-local) because the WTR vapor harness bundles each <script> separately —
// the helpers/hooks.js that calls setHooks and the spec's compiled template
// (which calls setHtml) are DIFFERENT module instances; a global bridges them.
const SANITIZE_HOOK_KEY = '__lwcVaporSanitizeHtmlContent__';
export function setSanitizeHtmlContentHook(hook: ((value: unknown) => unknown) | null): void {
    (globalThis as Record<string, unknown>)[SANITIZE_HOOK_KEY] = hook ?? undefined;
}

export function setHtml(el: Element, value: unknown): void {
    const castEl = el as Element & { $htmlRaw?: unknown; $html?: string };
    // Skip if the RAW bound value is unchanged (don't re-run the sanitizer).
    if ('$htmlRaw' in castEl && castEl.$htmlRaw === value) return;
    castEl.$htmlRaw = value;
    const hook = (globalThis as Record<string, unknown>)[SANITIZE_HOOK_KEY] as
        ((value: unknown) => unknown) | undefined;
    let html: string;
    if (hook) {
        // The sanitizer receives the raw value and returns the safe HTML string.
        // It may throw (e.g. the default hook requires an implementation) — let
        // that propagate to the caller (→ errorCallback / window error).
        // Apply the SAME type conversion as the no-hook path to the sanitized
        // result: `null` clears (''), everything else stringifies via the DOM
        // (`undefined` → "undefined", 42 → "42"). `String(null)` would wrongly be
        // "null" (directive-lwc-inner-html type-conversion).
        const sanitized = hook(value);
        html = sanitized === null ? '' : String(sanitized);
    } else {
        // Match LWC's inner-html type conversion: `null` clears (''), but
        // `undefined`/other values stringify (`undefined` → "undefined", 42 → "42").
        html = value === null ? '' : String(value);
    }
    castEl.$html = html;
    el.innerHTML = html;
}

function normalizeClass(value: any): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        return value.map(normalizeClass).filter(Boolean).join(' ');
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .filter((k) => value[k])
            .join(' ');
    }
    return '';
}
