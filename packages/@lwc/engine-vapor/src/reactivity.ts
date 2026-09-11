/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Deep reactivity membrane. `reactive(obj)` returns a Proxy that:
 *   - tracks reads per (target, key) so render effects subscribe to exactly the
 *     fields they read;
 *   - triggers dependents on writes (including new-key additions and deletions);
 *   - recursively wraps nested objects/arrays on access, so deep mutations
 *     (`this.state.user.name = x`, `this.items[0].label = y`) are reactive;
 *   - makes in-place Array mutations (`push`, `pop`, `shift`, `unshift`,
 *     `splice`, `sort`, `reverse`, index/length assignment) reactive by tracking
 *     and triggering a per-array ITERATE dependency.
 *
 * This mirrors the behavior of LWC's reactivity membrane / Vue 3's reactive(),
 * scoped to what the vapor runtime needs.
 */

import { track, trigger, createDep, type Dep } from './renderEffect';
import { logMutationForDep } from './mutation-logger';

/** Sentinel key representing "the set of keys / iteration order" of a target. */
const ITERATE_KEY = Symbol('iterate');

// Well-known (built-in) symbols — `Symbol.iterator`, `Symbol.toPrimitive`,
// `Symbol.toStringTag`, etc. These are PROTOCOL keys, not reactive data, so the
// membrane leaves reads/writes of them untracked (matching Vue's `reactive`,
// which skips `builtInSymbols`). USER symbols (`Symbol('yolo')`) ARE tracked, so a
// component storing state under a symbol key stays reactive (engine-core's
// observable-membrane observes symbol keys). Built once.
const builtInSymbols = new Set<symbol>(
    Object.getOwnPropertyNames(Symbol)
        // `arguments`/`caller` are poison-pill accessors on `Symbol` in strict mode.
        .filter((key) => key !== 'arguments' && key !== 'caller')
        .map((key) => (Symbol as unknown as Record<string, unknown>)[key])
        .filter((value): value is symbol => typeof value === 'symbol')
);

function isBuiltInSymbol(key: symbol): boolean {
    return builtInSymbols.has(key);
}

const depsForTarget = new WeakMap<object, Map<PropertyKey, Dep>>();
// Cache so the same source object always maps to the same proxy (identity) and
// proxies are not re-wrapped.
const proxyCache = new WeakMap<object, object>();
const rawCache = new WeakMap<object, object>();

function getDep(target: object, key: PropertyKey): Dep {
    let keyMap = depsForTarget.get(target);
    if (!keyMap) {
        keyMap = new Map();
        depsForTarget.set(target, keyMap);
    }
    let dep = keyMap.get(key);
    if (!dep) {
        dep = createDep();
        keyMap.set(key, dep);
    }
    return dep;
}

/**
 * Sentinel key for a per-target "render epoch" dep. Effects that must re-run on
 * EVERY change to the target (regardless of which key changed) — e.g. `lwc:on`,
 * which LWC re-evaluates on every component render — track this via
 * `trackEpoch(target)`; every field write bumps it via `triggerEpoch(target)`.
 */
const EPOCH_KEY = Symbol('epoch');

export function trackEpoch(target: object): void {
    track(getDep(target, EPOCH_KEY));
}

export function triggerEpoch(target: object): void {
    const keyMap = depsForTarget.get(target);
    const dep = keyMap?.get(EPOCH_KEY);
    if (dep) trigger(dep);
}

export function trackAccess(target: object, key: PropertyKey): void {
    track(getDep(target, key));
}

export function triggerUpdate(target: object, key: PropertyKey): void {
    const keyMap = depsForTarget.get(target);
    if (!keyMap) return;
    const dep = keyMap.get(key);
    if (dep) {
        // Dev-only: record which (owner, property-path) mutated, for the DevTools
        // "why did this re-render?" track. Subscription-gated — logs only for the
        // effects actually subscribed to this key (engine-core parity). DCE'd in prod.
        if (process.env.NODE_ENV !== 'production') {
            logMutationForDep(dep, target, key);
        }
        trigger(dep);
    }
}

function triggerIterate(target: object): void {
    const keyMap = depsForTarget.get(target);
    const dep = keyMap?.get(ITERATE_KEY);
    if (dep) {
        // In-place array mutation (`push`/`splice`/index-set/`length`) surfaces to
        // the DevTools track as a mutation of the array's `length` — matching
        // engine-core, where `aliases.push()` logs `aliases.length`.
        if (process.env.NODE_ENV !== 'production') {
            logMutationForDep(dep, target, 'length');
        }
        trigger(dep);
    }
}

function isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object';
}

/**
 * Only plain objects and arrays are deep-wrapped. Class instances (other than
 * plain objects), DOM nodes, dates, regexps, maps/sets, and the like are left
 * as-is — wrapping them risks infinite recursion (e.g. a getter returning `this`)
 * and breaks identity/branding the host relies on.
 */
function isObservable(value: unknown): value is object {
    if (!isObject(value)) return false;
    if (Array.isArray(value)) return true;
    // DOM nodes / events / window etc. are never observed.
    if (typeof Node !== 'undefined' && value instanceof Node) return false;
    if (typeof Event !== 'undefined' && value instanceof Event) return false;
    const proto = Object.getPrototypeOf(value);
    // Plain object: prototype is Object.prototype or null.
    return proto === Object.prototype || proto === null;
}

const arrayInstrumentations = createArrayInstrumentations();

function createArrayInstrumentations(): Record<string, (...args: any[]) => any> {
    const instrumentations: Record<string, (...args: any[]) => any> = {};
    // Mutating methods: run on the raw array, then trigger iteration + length.
    for (const method of [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse',
    ] as const) {
        instrumentations[method] = function (this: unknown[], ...args: unknown[]) {
            const raw = toRaw(this) as unknown[];
            const result = (Array.prototype[method] as any).apply(raw, args);
            // Triggering iteration is sufficient: `length` and index reads also
            // subscribe to the ITERATE dependency, so triggering it once re-runs
            // all of them without double-firing.
            triggerIterate(raw);
            return result;
        };
    }
    return instrumentations;
}

/**
 * Returns a deep-reactive proxy of `target`. Primitives are returned as-is.
 * Re-wrapping a proxy or wrapping an already-proxied source returns the cached
 * proxy so object identity is stable.
 */
export function reactive<T>(target: T): T {
    if (!isObservable(target)) return target;
    // Already a proxy (RAW probe handles proxies created elsewhere too).
    if (rawCache.has(target as object) || (target as any)[RAW]) return target;
    // Already has a proxy.
    const existing = proxyCache.get(target as object);
    if (existing) return existing as T;

    const isArray = Array.isArray(target);

    const proxy = new Proxy(target as object, {
        get(obj, key, receiver) {
            if (key === RAW) return obj;

            // Array mutation methods are instrumented to trigger reactivity.
            if (isArray && Object.prototype.hasOwnProperty.call(arrayInstrumentations, key)) {
                return arrayInstrumentations[key as string];
            }

            const value = Reflect.get(obj, key, receiver);
            // Built-in (protocol) symbols are never reactive — but a USER symbol key
            // (`obj[Symbol('yolo')]`) IS tracked + deep-wrapped, so state stored under
            // a symbol stays reactive (engine-core observes symbol keys).
            if (typeof key === 'symbol' && isBuiltInSymbol(key)) return value;

            // Track this key, and for arrays also track iteration on index/length
            // reads so length/iteration changes re-run dependents.
            trackAccess(obj, key);
            if (isArray && (key === 'length' || isIntegerKey(key))) {
                trackAccess(obj, ITERATE_KEY);
            }

            // Recursively wrap nested objects/arrays (lazy, on access).
            if (isObject(value)) {
                return reactive(value);
            }
            return value;
        },
        set(obj, key, value, receiver) {
            const hadKey =
                isArray && isIntegerKey(key)
                    ? Number(key) < (obj as unknown[]).length
                    : Object.prototype.hasOwnProperty.call(obj, key);
            const oldValue = (obj as any)[key];
            // Unwrap a reactive value before storing, so the raw graph stays raw.
            // NOTE: deliberately set on `obj` directly (no `receiver`) — the membrane
            // wraps plain data objects/arrays, so there are no prototype accessors
            // that need the proxy as `this`, and passing `receiver` (the proxy) would
            // re-dispatch a plain assignment through the `defineProperty` trap below
            // (double-handling). Matches Vue's reactive `set`.
            void receiver;
            const result = Reflect.set(obj, key, toRaw(value));
            // Built-in (protocol) symbols never trigger; a USER symbol key does
            // (its read was tracked above), so `obj[Symbol('yolo')] = x` re-renders.
            if (typeof key === 'symbol' && isBuiltInSymbol(key)) return result;

            if (!hadKey) {
                // New property/element: notify key + iteration.
                triggerUpdate(obj, key);
                triggerIterate(obj);
                if (isArray) triggerUpdate(obj, 'length');
            } else if (oldValue !== value) {
                triggerUpdate(obj, key);
                if (isArray && key === 'length') triggerIterate(obj);
            }
            return result;
        },
        deleteProperty(obj, key) {
            const hadKey = Object.prototype.hasOwnProperty.call(obj, key);
            const result = Reflect.deleteProperty(obj, key);
            if (hadKey && result && typeof key !== 'symbol') {
                triggerUpdate(obj, key);
                triggerIterate(obj);
            }
            return result;
        },
        defineProperty(obj, key, descriptor) {
            // `Object.defineProperty(reactiveObj, key, …)` triggers reactivity like a
            // plain assignment (decorators/track "track defined using
            // Object.defineProperty"). The `set` trap sets on `obj` directly (no
            // receiver), so a normal assignment does NOT reach here — only a genuine
            // `Object.defineProperty` call does.
            const hadKey = Object.prototype.hasOwnProperty.call(obj, key);
            const oldValue = (obj as Record<PropertyKey, unknown>)[key];
            const result = Reflect.defineProperty(obj, key, descriptor);
            if (result && typeof key !== 'symbol') {
                const newValue = (obj as Record<PropertyKey, unknown>)[key];
                if (!hadKey) {
                    triggerUpdate(obj, key);
                    triggerIterate(obj);
                } else if (oldValue !== newValue) {
                    triggerUpdate(obj, key);
                }
            }
            return result;
        },
        has(obj, key) {
            if (typeof key !== 'symbol') trackAccess(obj, key);
            return Reflect.has(obj, key);
        },
        ownKeys(obj) {
            trackAccess(obj, ITERATE_KEY);
            return Reflect.ownKeys(obj);
        },
    });

    proxyCache.set(target as object, proxy);
    rawCache.set(proxy, target as object);
    return proxy as T;
}

const RAW = Symbol('raw');

/** Returns the underlying raw object for a reactive proxy (or the value itself).
 *  This unwraps BOTH reactive and read-only proxies to the raw graph — the public
 *  `unwrap()` API relies on it (api/unwrap "unwraps api objects"). To PRESERVE a
 *  read-only wrapper (e.g. the component set-trap storing an @api value), use
 *  `toRawPreservingReadOnly` instead. */
export function toRaw<T>(value: T): T {
    if (!isObject(value)) return value;
    if (readOnlyProxies.has(value as object)) {
        return (readOnlyToRaw.get(value as object) as T) ?? value;
    }
    const raw = (value as any)[RAW];
    if (raw) return raw as T;
    // Proxies registered via registerRaw (e.g. the component `$cmp` proxy, which
    // doesn't trap the RAW symbol) are looked up here.
    const cached = rawCache.get(value as object);
    return cached ? (cached as T) : value;
}

/**
 * Register a proxy→raw mapping so `toRaw(proxy)` resolves to `raw`. Used for the
 * component `$cmp` proxy (built in the compat layer) so epoch tracking/triggering
 * agree on a single identity.
 */
export function registerRaw(proxy: object, raw: object): void {
    rawCache.set(proxy, raw);
}

function isIntegerKey(key: PropertyKey): boolean {
    return (
        typeof key === 'string' && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key
    );
}

/**
 * Backwards-compatible shallow proxy used by earlier code/tests. Now delegates to
 * the deep membrane so all callers get deep reactivity.
 */
export function createReactiveProxy<T extends object>(target: T): T {
    return reactive(target);
}

// ---------------------------------------------------------------------------
// READ-ONLY membrane (engine-core's `getReadOnlyProxy`). A value passed from a
// parent to a child as an `@api` prop is wrapped read-only so the CHILD cannot
// mutate it (`cmp.publicProp.x = 1` throws in dev, no-ops in prod) — matching
// engine-core, whose bridge setter does `newValue = getReadOnlyProxy(newValue)`.
// Reads recurse (nested objects are also read-only) and stay reactive (the child's
// bindings still re-run when the parent reassigns the prop). Identity is cached.
//
// A read-only proxy is marked with the READONLY symbol and tracked in `readOnlyProxies`
// so `toRaw` and `reactive` LEAVE IT INTACT (a read-only value must NOT be unwrapped to
// its mutable raw graph by the component set-trap's `toRaw`, nor re-wrapped mutable by
// the get-trap's `reactive`) — the read-only wrapper must survive end-to-end.
const READONLY = Symbol('readonly');
const readOnlyCache = new WeakMap<object, object>();
const readOnlyProxies = new WeakSet<object>();
// readonly proxy -> its raw object (so `toRaw`/`unwrap` resolve to the original).
const readOnlyToRaw = new WeakMap<object, object>();

export function isReadOnly(value: unknown): boolean {
    return isObject(value) && readOnlyProxies.has(value as object);
}

/** Like `toRaw`, but a READ-ONLY proxy is returned UNCHANGED (its read-only wrapper
 *  preserved) — used by the component set-trap so an @api value passed from a parent
 *  stays read-only when stored, while the public `unwrap()` (plain `toRaw`) still
 *  resolves a read-only proxy to its raw object. */
export function toRawPreservingReadOnly<T>(value: T): T {
    if (isObject(value) && readOnlyProxies.has(value as object)) return value;
    return toRaw(value);
}

export function getReadOnlyProxy<T>(target: T): T {
    if (!isObservable(target)) return target;
    if (isReadOnly(target)) return target;
    // Unwrap a reactive proxy to its raw graph first, so a single read-only wrapper
    // sits over the raw object (not over the reactive proxy).
    const raw = toRaw(target) as object;
    const existing = readOnlyCache.get(raw);
    if (existing) return existing as T;
    const isArray = Array.isArray(raw);

    const blockMutation = (key: PropertyKey): boolean => {
        if (process.env.NODE_ENV !== 'production') {
            // engine-core (observable-membrane) THROWS on a read-only mutation in dev.
            throw new Error(
                `Invalid mutation: Cannot set "${String(key)}" on "[object Object]". ` +
                    `"[object Object]" is read-only.`
            );
        }
        // Production: silently ignore the mutation (engine-core no-ops in prod).
        return true;
    };

    const proxy = new Proxy(raw, {
        get(obj, key, receiver) {
            if (key === READONLY) return true;
            if (key === RAW) return obj;
            const value = Reflect.get(obj, key, receiver);
            if (typeof key === 'symbol') return value;
            // Track reads so the child re-renders if the PARENT reassigns the prop
            // (the field-level dep on the owning component drives that; here we keep
            // deep reads reactive for the read-only graph itself).
            trackAccess(obj, key);
            if (isArray && (key === 'length' || isIntegerKey(key))) {
                trackAccess(obj, ITERATE_KEY);
            }
            if (isObject(value)) {
                return getReadOnlyProxy(value);
            }
            return value;
        },
        set(_obj, key) {
            return blockMutation(key);
        },
        deleteProperty(_obj, key) {
            return blockMutation(key);
        },
        defineProperty(_obj, key) {
            return blockMutation(key);
        },
        has(obj, key) {
            if (typeof key !== 'symbol') trackAccess(obj, key);
            return Reflect.has(obj, key);
        },
    });

    readOnlyCache.set(raw, proxy);
    readOnlyProxies.add(proxy);
    readOnlyToRaw.set(proxy, raw);
    return proxy as T;
}
