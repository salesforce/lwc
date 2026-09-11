/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderEffect } from '../renderEffect';
import { toRaw } from '../reactivity';
import { EffectScope } from '../scope';
import { getAdapterContextToken, registerContextConsumer } from './context';
import { getFeatureFlagValue } from './reporting';
import type { VaporInstance } from './lightning-element';

/**
 * Vapor implementation of the `@wire` protocol. The compiler emits wire metadata
 * via registerDecorators:
 *   wire: { <propOrMethodName>: { adapter, config: (cmp) => obj, dynamic: string[], method?: 1 } }
 *
 * For each wired field/method we instantiate the adapter with a data callback,
 * call connect(), compute+push the config (re-pushing whenever a `$`-prefixed
 * reactive param changes), and on emit either assign the field (triggering the
 * component's reactivity) or invoke the method. On unmount we disconnect.
 */

// Well-known keys the legacy wire-service bridge reads off the data callback.
const DEPRECATED_WIRED_ELEMENT_HOST = '$$DeprecatedWiredElementHostKey$$';
const DEPRECATED_WIRED_PARAMS_META = '$$DeprecatedWiredParamsMetaKey$$';

/** Read an LWC runtime/feature flag. `setFeatureFlagForTest` writes to the shared
 *  reporting feature-flag store (getFeatureFlagValue), while some runtime flags are
 *  on `globalThis.lwcRuntimeFlags` (set by the HTML harness). Check both so e.g.
 *  ENABLE_WIRE_SYNC_EMIT (set via setFeatureFlagForTest) is honored. */
function getFeatureFlagLocal(name: string): boolean {
    if (getFeatureFlagValue(name)) return true;
    const flags = (globalThis as any).lwcRuntimeFlags;
    return Boolean(flags && flags[name]);
}

interface WireMeta {
    adapter: any;
    config?: (cmp: any) => Record<string, unknown>;
    dynamic?: string[];
    method?: unknown;
}

interface ActiveWire {
    adapter: { connect(): void; update(config: any, context?: any): void; disconnect(): void };
}

interface InstanceWiring {
    wires: ActiveWire[];
    scope: EffectScope;
    contextDisconnects?: Array<() => void>;
}

const wiringByInstance = new WeakMap<VaporInstance, InstanceWiring>();

/**
 * Install and connect all wire adapters declared on the component. Called at
 * mount, after the component instance and its reactive proxy exist.
 */
/** Shallow-equal comparison of two wire config objects (same keys + `===` values). */
function shallowEqualConfig(
    a: Record<string, unknown>,
    b: Record<string, unknown>,
    dynamicKeys?: string[]
): boolean {
    // When the wire declares dynamic params, compare ONLY those (matching
    // engine-core's isDifferentConfig): a static param that recomputes to a fresh
    // object/array each render (e.g. `staticComplexParam: ['a','b']`) must not force
    // a spurious re-emit (wire/legacy-adapters "same config"). With no dynamic
    // params, fall back to a full shallow compare.
    const keys = dynamicKeys && dynamicKeys.length ? dynamicKeys : Object.keys(a);
    if (!dynamicKeys || !dynamicKeys.length) {
        if (Object.keys(a).length !== Object.keys(b).length) return false;
    }
    for (const k of keys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

/**
 * CONSTRUCT (but do not connect) every wire adapter, eagerly at instance-create.
 * engine-core builds its wire connectors in vm.ts BEFORE the element is connected,
 * so an adapter's constructor side effects (e.g. recording the host's tagName via
 * the `{ tagName }` 2nd arg) happen at `createElement` time — even for an element
 * that is never appended (wire/wiring "context aware > should receive the source
 * element tag name when adapter is constructed"). The constructed instances are
 * stashed on `instance.preConstructedWires` and REUSED by `installWireAdapters` at
 * mount (it connects + starts the config-watch). The mount path falls back to
 * constructing fresh if no pre-constructed adapter is present (e.g. a reconnect,
 * where the prior adapters were disconnected).
 */
export function constructWireAdapters(instance: VaporInstance): void {
    const wireMeta = (instance.decorators as { wire?: Record<string, WireMeta> }).wire;
    if (!wireMeta) return;
    const cmp = instance.component as any;
    const built = new Map<string, unknown>();
    for (const name of Object.keys(wireMeta)) {
        const adapterInstance = buildWireAdapter(instance, cmp, name, wireMeta[name]);
        if (adapterInstance !== undefined) built.set(name, adapterInstance);
    }
    if (built.size) instance.preConstructedWires = built;
}

/** Build the data callback + construct one adapter. Returns the adapter, or
 *  `undefined` if the adapter constructor threw or the meta is not an adapter. */
function buildWireAdapter(
    instance: VaporInstance,
    cmp: any,
    name: string,
    def: WireMeta
): ActiveWire['adapter'] | undefined {
    let Adapter: any = def.adapter;
    if (Adapter && Adapter.adapter) Adapter = Adapter.adapter;
    if (typeof Adapter !== 'function') return undefined;

    const isMethod = def.method != null;
    // Record wired FIELD names so the component proxy returns their adapter-set
    // values RAW (identity-preserving) rather than deep-wrapped.
    if (!isMethod) {
        (instance.wiredFields ??= new Set()).add(name);
    }

    // Data callback: push emitted values to the field or invoke the method.
    const dataCallback = (value: unknown) => {
        if (isMethod) {
            const fn = cmp[name];
            if (typeof fn === 'function') fn.call(cmp, value);
        } else {
            cmp[name] = value;
        }
    };
    // Legacy wire-service bridge reads the host element and the dynamic param
    // names off these well-known string keys on the data callback. Provide
    // them so `register()`-based adapters (EchoWireAdapter, etc.) work.
    (dataCallback as any)[DEPRECATED_WIRED_ELEMENT_HOST] = instance.host;
    (dataCallback as any)[DEPRECATED_WIRED_PARAMS_META] = def.dynamic ?? [];

    try {
        return new Adapter(dataCallback, { tagName: instance.tagName });
    } catch {
        return undefined;
    }
}

export function installWireAdapters(instance: VaporInstance): void {
    const wireMeta = (instance.decorators as { wire?: Record<string, WireMeta> }).wire;
    if (!wireMeta) return;
    const cmp = instance.component as any;
    const wires: ActiveWire[] = [];
    // Context-provider disconnect callbacks (invoked on unmount).
    const contextDisconnects: Array<() => void> = [];
    // Own scope so the config-watching render effects are torn down on disconnect.
    const scope = new EffectScope();
    // Adapters constructed eagerly at instance-create (constructWireAdapters).
    // Consumed once here; a later reconnect re-builds fresh (the prior adapters
    // were disconnected on teardown).
    const preBuilt = instance.preConstructedWires;
    instance.preConstructedWires = undefined;

    for (const name of Object.keys(wireMeta)) {
        const def = wireMeta[name];
        // Support callable adapters: `adapter.adapter` is the real constructor.
        let Adapter: any = def.adapter;
        if (Adapter && Adapter.adapter) Adapter = Adapter.adapter;
        if (typeof Adapter !== 'function') continue;

        // Reuse the eagerly-constructed adapter (so its constructor ran exactly once,
        // at createElement); otherwise construct now (reconnect path).
        let adapterInstance = preBuilt?.get(name) as ActiveWire['adapter'] | undefined;
        if (adapterInstance === undefined) {
            adapterInstance = buildWireAdapter(instance, cmp, name, def);
            if (adapterInstance === undefined) continue;
        }

        try {
            adapterInstance.connect();
        } catch {
            /* ignore */
        }

        const hasDynamicParams = Array.isArray(def.dynamic) && def.dynamic.length > 0;
        // Coalesce dynamic-param re-pushes to a microtask. Vapor is fine-grained, so
        // `elm.a = 1; elm.b = 4` re-runs this effect TWICE — once with the
        // intermediate `sum` (a=1,b=old) and once with the final. engine-core batches
        // to a microtask, so both writes settle before the config is compared; the
        // net config is shallow-equal to the last one and update() is skipped. Without
        // coalescing vapor pushes the stale intermediate config (wire/legacy-adapters
        // "same config" case 1). A push is scheduled once per turn; it reads
        // `latestConfig` at flush time (the settled value).
        let pushScheduled = false;
        // The last config object actually pushed to the adapter — used to skip
        // re-pushing when the newly-computed config is shallow-equal (engine-core
        // only calls update() when the config changed).
        let lastPushedConfig: Record<string, unknown> | undefined;
        // Latest config + latest context for this wire, so either changing
        // re-pushes both to the adapter's update().
        let latestConfig: unknown = {};
        let latestContext: unknown;

        // Context protocol: if this adapter has a registered context provider,
        // subscribe by dispatching a bubbling event from the host. The provider
        // pushes context values, which we forward to update() as `{ value }`.
        const contextToken = getAdapterContextToken(Adapter);
        if (contextToken) {
            registerContextConsumer(instance.host, contextToken, {
                setNewContext(newContext: unknown): boolean {
                    // `newContext` is already the context object shaped by the
                    // provider (e.g. `{ value }`); pass it through to update() as-is.
                    latestContext = newContext;
                    try {
                        adapterInstance.update(
                            latestConfig as Record<string, unknown>,
                            newContext as never
                        );
                    } catch {
                        /* ignore */
                    }
                    return true;
                },
                setDisconnectedCallback(cb: () => void) {
                    contextDisconnects.push(cb);
                },
            });
        }

        // Push config inside a render effect so that reactive `$`-prefixed params
        // (read by the compiler-generated `config` fn off the component proxy)
        // are tracked; when any changes, the effect re-runs and re-pushes config.
        // For wires WITH dynamic params, the very first emit is deferred to a
        // microtask (matching engine-core, which does Promise.resolve().then(...)
        // unless ENABLE_WIRE_SYNC_EMIT) so the params can settle first.
        scope.run(() => {
            renderEffect(() => {
                const rawConfig = typeof def.config === 'function' ? def.config(cmp) : {};
                // Unwrap each config value to its RAW object: `def.config(cmp)` reads
                // the component's reactive proxy, so a param that is an object comes
                // back as a reactive PROXY. The wire adapter echoes these values, and
                // tests assert reference identity (`toBe(expected)`) — which a proxy
                // breaks. `toRaw` on a proxy returns the underlying raw object (whose
                // nested properties are themselves raw), restoring identity. The read
                // above still happened through the proxy, so reactive params remain
                // tracked for re-push. (wire/property-trap "should return object value").
                const config: Record<string, unknown> = {};
                for (const k of Object.keys(rawConfig as Record<string, unknown>)) {
                    config[k] = toRaw((rawConfig as Record<string, unknown>)[k]);
                }
                latestConfig = config;
                // The deferred (microtask) first emit reads `latestConfig` at push
                // time — NOT this run's captured `config` — so if a reactive param
                // changes synchronously before the microtask (re-running this
                // effect and updating latestConfig), the deferred push uses the
                // FRESH config rather than overwriting with the stale initial one.
                const push = (useLatest: boolean) => {
                    const cfg = (useLatest ? latestConfig : config) as Record<string, unknown>;
                    // Skip if config is shallow-equal to the last pushed one (no
                    // param actually changed) — matches engine-core, which only
                    // invokes update() on a config change. Context-bearing wires
                    // always push (the context may have changed).
                    if (
                        !contextToken &&
                        lastPushedConfig &&
                        shallowEqualConfig(lastPushedConfig, cfg, def.dynamic)
                    ) {
                        return;
                    }
                    lastPushedConfig = cfg;
                    try {
                        adapterInstance.update(
                            cfg,
                            (contextToken ? latestContext : undefined) as never
                        );
                    } catch {
                        /* adapter update errors shouldn't crash the host */
                    }
                };
                if (hasDynamicParams && !getFeatureFlagLocal('ENABLE_WIRE_SYNC_EMIT')) {
                    // Dynamic-param wires ALWAYS coalesce to a microtask (not just the
                    // first emit): multiple synchronous param writes each re-run this
                    // effect + update `latestConfig`, but only ONE push flushes per
                    // turn, reading the SETTLED config — so an intermediate config that
                    // recomputes back to the last value is never pushed (engine-core's
                    // async batching). Scheduled once per turn via `pushScheduled`.
                    if (!pushScheduled) {
                        pushScheduled = true;
                        void Promise.resolve().then(() => {
                            pushScheduled = false;
                            push(true);
                        });
                    }
                } else {
                    push(false);
                }
            });
        });

        wires.push({ adapter: adapterInstance });
    }

    wiringByInstance.set(instance, { wires, scope, contextDisconnects });
}

/** Disconnect all wire adapters of an instance. Called at unmount. */
export function disconnectWireAdapters(instance: VaporInstance): void {
    const wiring = wiringByInstance.get(instance);
    if (!wiring) return;
    wiring.scope.stop();
    // Notify context providers that this consumer disconnected.
    if (wiring.contextDisconnects) {
        for (const cb of wiring.contextDisconnects) {
            try {
                cb();
            } catch {
                /* ignore */
            }
        }
    }
    for (const w of wiring.wires) {
        try {
            w.adapter.disconnect();
        } catch {
            /* ignore */
        }
    }
    wiringByInstance.delete(instance);
}
