/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
//
// Dev-mode mutation tracking for DevTools performance profiling — the vapor port
// of engine-core's `framework/mutation-logger.ts` + `getMutationProperties`. Its
// sole purpose is to answer "why did this component re-render?" by attaching the
// list of mutated property paths to the `lwc-rerender` User Timing measure's
// `detail.devtools.properties`.
//
// ENTIRELY dev-only: every call site is wrapped in `process.env.NODE_ENV !==
// 'production'` so the bundler dead-code-eliminates it from the production build
// (zero runtime/perf cost in prod — the krausest benchmark is a prod build).
//
// Mirrors engine-core precisely:
//   - `trackTargetForMutationLogging(key, target)` deep-walks a tracked object
//     graph (own names AND symbols, including non-enumerable), registering each
//     nested object with its human-readable path (`previousName.suffix`,
//     `favoriteFlavors[0]`, `wackyAccessors[Symbol(whoa)]`). Recursion-guarded.
//   - a mutation is logged LAZILY and SUBSCRIPTION-GATED: only when the mutated
//     (target, key) has a live reactive effect subscribed to it (the vapor
//     analogue of engine-core's `valueMutated` iterating the key's reactive
//     observers). This is what makes `aliases.push()` log only `aliases.length`
//     and the recursive object log only `recursiveObject.foo`.
//   - the owner (component instance) of each mutation is resolved from the
//     subscribed effect's `.owner`, mirroring engine-core's
//     `reactiveObserversToVMs` — this is what groups multi-instance mutations as
//     `<x-child> (×2)` and parent+child as `<x-child>, <x-parent>`.
//
import {
    ArrayJoin,
    ArrayMap,
    ArrayPush,
    ArraySort,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    isArray,
    isNull,
    isObject,
    isString,
    isUndefined,
    toString,
} from '@lwc/shared';
import type { Dep } from './renderEffect';

/** The minimal owner shape the logger needs (a `VaporInstance`). */
interface OwnerLike {
    tagName: string;
    idx: number;
}

interface EffectLike {
    owner: OwnerLike | null;
}

export interface MutationLog {
    owner: OwnerLike;
    prop: string;
}

// Maps each tracked (raw) object to its human-readable property path, e.g.
// `previousName.suffix` → the suffix object. Seeded by
// `trackTargetForMutationLogging`; read by `logMutationForDep` to build the full
// path of a mutated key. WeakMap keyed on the RAW object (what the reactivity
// membrane's traps receive), so it aligns with `triggerUpdate(rawTarget, key)`.
const targetsToPropertyKeys = new WeakMap<object, PropertyKey>();
let mutationLogs: MutationLog[] = [];

// Create a human-readable member access notation like `obj.foo` or `arr[1]`,
// handling edge cases like `obj[Symbol("bar")]` and `obj["spaces here"]`.
export function toPrettyMemberNotation(
    parent: PropertyKey | undefined,
    child: PropertyKey
): string {
    if (isUndefined(parent)) {
        // Bare prop (a top-level component field), just stringify the child.
        return toString(child);
    } else if (!isString(child)) {
        // Symbol/number, e.g. `obj[Symbol("foo")]` or `obj[1234]`.
        return `${toString(parent)}[${toString(child)}]`;
    } else if (/^\w+$/.test(child)) {
        // Dot-notation-safe string, e.g. `obj.foo`.
        return `${toString(parent)}.${child}`;
    } else {
        // Bracket-notation-requiring string, e.g. `obj["prop with spaces"]`.
        return `${toString(parent)}[${JSON.stringify(child)}]`;
    }
}

function safelyCallGetter(target: any, key: PropertyKey): unknown {
    // Arbitrary getters can throw. We don't want to throw an error just due to
    // dev-mode-only mutation tracking (used for performance debugging) so ignore
    // errors here — the getterThrows fixture relies on this.
    try {
        return target[key];
    } catch (_err) {
        /* ignore */
    }
}

function isRevokedProxy(target: object): boolean {
    try {
        // `'' in obj` never throws for normal objects or active proxies, but is
        // disallowed for revoked proxies.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        '' in target;
        return false;
    } catch (_) {
        return true;
    }
}

/**
 * Flush all logs written so far and return them. Cleared so the next re-render
 * starts from a clean slate. (Only called in dev — guarded by the caller.)
 */
export function getAndFlushMutationLogs(): MutationLog[] {
    const result = mutationLogs;
    mutationLogs = [];
    return result;
}

/**
 * Log a mutation for every reactive effect currently subscribed to (`target`,
 * `key`). Subscription-gated: an effect with no owner (e.g. the perf bench's
 * owner-less effects) is skipped, and a key with no subscribers logs nothing.
 * @param dep - the dependency (set of subscribed effects) being triggered
 * @param target - the raw object being mutated
 * @param key - the property key that was mutated
 */
export function logMutationForDep(dep: Dep, target: object, key: PropertyKey): void {
    // No subscribers → nothing to log (was `dep.size === 0` on the old Set-based dep;
    // now an empty subscriber Link list).
    let link = dep.subs;
    if (link === undefined) {
        return;
    }
    const parentKey = targetsToPropertyKeys.get(target);
    const prop = toPrettyMemberNotation(parentKey, key);
    // Walk the dep's subscriber list (was `for (const effect of dep)`). A dev-only
    // path, so the straight walk with no dedup is fine — a duplicate-linked effect
    // logging its prop twice is harmless (getMutationProperties de-dups by tag/key).
    for (; link !== undefined; link = link.nextSub) {
        const owner = (link.sub as unknown as EffectLike).owner;
        // Skip owner-less effects (perf bench) — mirrors engine-core skipping a
        // reactive observer with no associated VM.
        if (owner !== null && isString(owner.tagName)) {
            ArrayPush.call(mutationLogs, { owner, prop });
        }
    }
}

/**
 * Deeply track all objects reachable from `target`, associating each with a
 * human-readable path. Recursion-guarded (so a recursive object graph doesn't
 * loop forever, and an object keeps its FIRST — shortest — registered path).
 * @param key - path of `target` within its component (e.g. `previousName`)
 * @param target - tracked target object
 */
export function trackTargetForMutationLogging(key: PropertyKey, target: any): void {
    if (targetsToPropertyKeys.has(target)) {
        // Guard against recursive objects — don't traverse forever, and keep the
        // FIRST (shortest) path (recursiveObject stays `recursiveObject`, not
        // `recursiveObject.deep.deep`).
        return;
    }

    // Revoked proxies (e.g. window props in LWS sandboxes) throw if we track them.
    if (isObject(target) && !isNull(target) && !isRevokedProxy(target)) {
        // Only track non-primitives; others are invalid as WeakMap keys.
        targetsToPropertyKeys.set(target, key);

        if (isArray(target)) {
            for (let i = 0; i < target.length; i++) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, i),
                    safelyCallGetter(target, i)
                );
            }
        } else {
            // Track own property names AND symbols (including non-enumerable),
            // consistent with observable-membrane. Two loops (rather than
            // concatenating) since this path is hot.
            for (const prop of getOwnPropertyNames(target)) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, prop),
                    safelyCallGetter(target, prop)
                );
            }
            for (const sym of getOwnPropertySymbols(target)) {
                trackTargetForMutationLogging(
                    toPrettyMemberNotation(key, sym),
                    safelyCallGetter(target, sym)
                );
            }
        }
    }
}

/**
 * Build the DevTools `properties` rows from a set of mutation logs — the vapor
 * port of engine-core's `getMutationProperties`. Produces, sorted by tag name:
 *   - a summary row `['Component'|'Components', '<x-foo>' | '<x-foo> (×2)' | '<a>, <b>']`
 *   - one detail row per tag `['<x-foo>', 'propA, propB']` (props sorted)
 */
export function getMutationProperties(mutationLogs: MutationLog[] | undefined): [string, string][] {
    if (isUndefined(mutationLogs) || mutationLogs.length === 0) {
        return [];
    }

    // Track unique instance ids + mutated prop keys per tag name.
    const tagNamesToIdsAndProps = new Map<string, { ids: Set<number>; keys: Set<string> }>();
    for (const {
        owner: { tagName, idx },
        prop,
    } of mutationLogs) {
        let idsAndProps = tagNamesToIdsAndProps.get(tagName);
        if (isUndefined(idsAndProps)) {
            idsAndProps = { ids: new Set(), keys: new Set() };
            tagNamesToIdsAndProps.set(tagName, idsAndProps);
        }
        idsAndProps.ids.add(idx);
        idsAndProps.keys.add(prop);
    }

    // Sort by tag name.
    const entries = ArraySort.call(
        [...tagNamesToIdsAndProps],
        (a: [string, unknown], b: [string, unknown]) => a[0].localeCompare(b[0])
    ) as [string, { ids: Set<number>; keys: Set<string> }][];
    const tagNames = ArrayMap.call(entries, (item: [string, unknown]) => item[0]) as string[];

    // `<x-foo>` for one instance, `<x-foo> (×2)` for two (× = ×).
    const tagNamesToDisplayTagNames = new Map<string, string>();
    for (const tagName of tagNames) {
        const { ids } = tagNamesToIdsAndProps.get(tagName)!;
        const displayTagName = `<${tagName}>${ids.size > 1 ? ` (×${ids.size})` : ''}`;
        tagNamesToDisplayTagNames.set(tagName, displayTagName);
    }

    // Summary row (plural when >1 tag OR >1 instance of the single tag).
    const usePlural = tagNames.length > 1 || tagNamesToIdsAndProps.get(tagNames[0])!.ids.size > 1;
    const result: [string, string][] = [
        [
            `Component${usePlural ? 's' : ''}`,
            ArrayJoin.call(
                ArrayMap.call(tagNames, (tag: string) => tagNamesToDisplayTagNames.get(tag)),
                ', '
            ) as string,
        ],
    ];

    // Detail rows.
    for (const [tagName, { keys }] of entries) {
        const displayTagName = tagNamesToDisplayTagNames.get(tagName)!;
        ArrayPush.call(result, [
            displayTagName,
            ArrayJoin.call(ArraySort.call([...keys]), ', ') as string,
        ]);
    }

    return result;
}
