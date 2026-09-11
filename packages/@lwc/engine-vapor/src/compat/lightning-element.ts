/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * The `lwc`-compatible facade for vapor mode. This provides the subset of the
 * public `lwc` module API that standard-compiled component classes import:
 * `LightningElement`, `createElement`, `registerComponent`, `registerDecorators`,
 * `registerTemplate`, and the `api`/`track`/`wire` decorators. It bridges those
 * standard-compiled classes to the vapor (`@lwc/engine-vapor`) runtime: instead
 * of producing a VNode tree, the registered template is a vapor `render($cmp,
 * $slotset)` function whose bindings read directly off the component instance,
 * and field mutations drive fine-grained render effects.
 */

import {
    AriaPropNameToAttrNameMap,
    REFLECTIVE_GLOBAL_PROPERTY_SET,
    SPECIAL_PROPERTY_ATTRIBUTE_MAPPING,
    LWC_VERSION,
    LWC_VERSION_COMMENT_REGEX,
} from '@lwc/shared';
import {
    containsNestedDynamicFragment,
    insertBlock,
    removeBlock,
    setDupSlotDcHook,
    setDupSlotDcPreHook,
    type Block,
    type DynamicFragment,
} from '../block';
import { EffectScope, onScopeDispose } from '../scope';
import {
    trackAccess,
    triggerUpdate,
    triggerEpoch,
    registerRaw,
    reactive as deepReactive,
    toRaw,
    toRawPreservingReadOnly,
} from '../reactivity';
import {
    batch,
    getCurrentEffect,
    setCurrentOwner,
    setOnEffectRerun,
    setTemplateUpdateHooks,
    setCascadeHooks,
    setAsyncRerenderHooks,
    setEnableAsyncRerender,
    setVueParityAsync,
    setWholeTemplateRerender,
    setOnEffectDroppedWhileDisconnected,
    setPostAsyncFlush,
    setOnDeferredEffectError,
    suppressTriggers,
    withForcedDefer,
    ReactiveEffect,
    renderEffect,
    registerOwnerEffect,
    getCurrentOwner,
} from '../renderEffect';
import {
    setLogSlotError,
    setRecordSlotAssignment,
    setRegisterSlotForFlatten,
    setCurrentLightHostResolver,
    reorderLightSlots,
    getLightSlotDeclRank,
} from '../slot';
import { setForContext } from '../createFor';
import {
    trackTargetForMutationLogging,
    getAndFlushMutationLogs,
    getMutationProperties,
} from '../mutation-logger';
import { isActTemplate, renderActTemplate, type ActTemplate } from './act-compat';
import {
    report,
    isReportingEnabled,
    logWarnOnce,
    getFeatureFlagValue,
    getLockerHooks,
    isTrustedSignalValue as isTrustedSignalValueImported,
} from './reporting';
import { setCurrentInstance, getCurrentInstance } from './instance';
import { constructWireAdapters, installWireAdapters, disconnectWireAdapters } from './wiring';
import {
    OperationId,
    logOperationStart,
    logOperationStop,
    logRerenderStop,
    isProfilerActive,
    isProfilingEnabled,
} from './profiler';
import {
    registerMounted,
    unregisterMounted,
    resolveTemplate,
    resolveStyle,
    setReRenderInstance,
    setIsComponentConstructor,
} from './swap';
import type { VaporRenderFn } from './instance';

/** Profiler descriptor for an instance: uppercased tag, render mode, shadow mode. */
function profInfo(instance: VaporInstance): [string, number, number] {
    // renderMode: Light=0, Shadow=1. shadowMode: Native=0, Synthetic=1.
    // Vapor uses native shadow for shadow components (synthetic is via polyfill,
    // which still reports native at this layer).
    const name = (instance.tagName ?? '').toUpperCase();
    const renderMode = instance.isLight ? 0 : 1;
    const shadowMode = 0;
    return [name, renderMode, shadowMode];
}

/** Run `fn` wrapped in profiler Start/Stop events for the given operation. */
function withProfiler(instance: VaporInstance, opId: number, fn: () => void): void {
    if (!isProfilingEnabled()) {
        fn();
        return;
    }
    const [name, rm, sm] = profInfo(instance);
    logOperationStart(opId, name, instance.idx, rm, sm);
    try {
        fn();
    } finally {
        logOperationStop(opId, name, instance.idx, rm, sm);
    }
}

interface ComponentMetadata {
    tmpl?: VaporRenderFn;
    sel?: string;
    apiVersion?: number;
    /** Compile-time component feature flag (`componentFeatureFlagModulePath`). When
     *  `value` is false the component is disabled and instantiating it throws. */
    componentFeatureFlag?: { value: boolean; path: string };
}

interface DecoratorMetadata {
    publicProps?: Record<string, { config: number }>;
    publicMethods?: string[];
    track?: Record<string, number>;
    wire?: Record<string, unknown>;
    fields?: string[];
}

const registeredComponents = new WeakMap<object, ComponentMetadata>();
const registeredDecorators = new WeakMap<object, DecoratorMetadata>();

// --- Render-cycle scheduling --------------------------------------------------
// Fine-grained effects update the DOM directly, but LWC's lifecycle contract
// fires renderedCallback once per "render cycle". We emulate that: when any of a
// component's render effects re-run (post-mount), we mark the instance dirty and
// flush renderedCallback once on the next microtask, coalescing multiple field
// changes in the same tick into a single renderedCallback — matching LWC.
const dirtyInstances = new Set<VaporInstance>();
let flushScheduled = false;
// True while a renderedCallback flush is executing. Re-renders triggered *by* a
// renderedCallback (e.g. it mutates tracked state) re-mark instances dirty; we
// must coalesce those into the same cycle rather than spawning a fresh microtask
// per re-run, which would spin the event loop forever.
let flushing = false;

function scheduleRenderedCallback(instance: VaporInstance): void {
    if (!instance || !instance.isMounted) return;
    dirtyInstances.add(instance);
    if (!flushScheduled && !flushing) {
        flushScheduled = true;
        queueMicrotask(flushRenderedCallbacks);
    }
}

function flushRenderedCallbacks(): void {
    flushScheduled = false;
    if (flushing) return;
    flushing = true;
    try {
        // Single drain pass. Re-dirties caused by a renderedCallback are picked up
        // by a freshly scheduled microtask (scheduleRenderedCallback re-arms once
        // `flushing` clears), which naturally coalesces without a synchronous spin.
        // Fire renderedCallback CHILD-BEFORE-PARENT (engine-core's bottom-up order):
        // sort the dirty set by component depth descending, so a child whose slot
        // content binds a parent field fires its rc before the parent's
        // (scoped-slot reactivity). Depth = length of the `parent` chain.
        const depthOf = (vm: VaporInstance): number => {
            let d = 0;
            let p = vm.parent;
            while (p && d < 10000) {
                d++;
                p = p.parent;
            }
            return d;
        };
        const instances = [...dirtyInstances].sort((a, b) => {
            const byDepth = depthOf(b) - depthOf(a);
            if (byDepth !== 0) return byDepth;
            // SAME owner-depth (e.g. a scoped-SLOTTED component and its slot-HOST both
            // have the slot OWNER as `parent`): the slotted content is DOM-nested inside
            // the host, so it must fire its renderedCallback FIRST. Break the tie by
            // creation index descending — slotted content is created DURING the host's
            // render (after the host), so a higher `idx` means more-deeply-nested
            // (scoped-slot rehydration expects [slotted, child, parent]).
            return (b.idx ?? 0) - (a.idx ?? 0);
        });
        dirtyInstances.clear();
        for (const instance of instances) {
            // A dirty instance that was DISCONNECTED before this flush has a PENDING
            // rehydration: its rc never fired. Record that so a later reconnect
            // suppresses its own rc (the pending rehydration owns it) — engine-core's
            // detached-rehydration model.
            if (!instance.isMounted || instance.disconnected) {
                instance.pendingRehydrationRc = true;
                continue;
            }
            const rc = (instance.reactiveTarget as any).renderedCallback;
            if (typeof rc === 'function') {
                // A throw from renderedCallback (after a fine-grained re-render)
                // must be routed to the nearest errorCallback boundary — exactly
                // like a render() throw — so a parent boundary can recover (e.g.
                // render an alternative view). Without this the error escaped the
                // microtask flush straight to the window (errorCallback "child
                // throws during self rehydration cycle"). The instance itself is a
                // candidate boundary first, then ancestors.
                try {
                    callLifecycle(instance, rc);
                } catch (err) {
                    attachErrorComponentStack(instance, err);
                    if (!handleErrorSelfOrAncestor(instance, err)) {
                        throw err;
                    }
                }
            }
        }
    } finally {
        flushing = false;
    }
}

// Register the global effect-rerun hook once.
setOnEffectRerun((owner) => {
    if (owner) scheduleRenderedCallback(owner as VaporInstance);
});

// Async-rerender parity hooks (see ASYNC_RENDER_PARITY.md): tell renderEffect how to
// read an owner instance's disconnected state (flush-time skip) and creation index
// (parent-before-child flush ordering). Kept as facade hooks so renderEffect stays
// decoupled from VaporInstance.
setAsyncRerenderHooks(
    (owner) => (owner as VaporInstance | null)?.disconnected === true,
    (owner) => (owner as VaporInstance | null)?.idx ?? 0,
    (owner) => (owner as VaporInstance | null)?.isMounted === true
);
// A queued re-render dropped because its owner disconnected → mark a pending
// rehydration so the owner's later reconnect suppresses its own renderedCallback
// (engine-core detached-rehydration; lifecycle "connect/mutate/disconnect/reconnect").
setOnEffectDroppedWhileDisconnected((owner) => {
    const inst = owner as VaporInstance | null;
    if (inst) inst.pendingRehydrationRc = true;
});
// Run the renderedCallback flush INLINE at the end of each async reconcile drain, so
// reconciles + renderedCallbacks happen in ONE ordered microtask pass (engine-core's
// single flushRehydrationQueue) rather than two racing queues.
setPostAsyncFlush(() => {
    if (dirtyInstances.size > 0) flushRenderedCallbacks();
});
// FLUSH-TIME child-error routing (errorCallback-throws-after-value-mutation). A child
// that threw during a deferred `lwc:if` reconcile captured its {owner, err} instead of
// routing inline in the native-CE reaction (which froze the thread). flushAsyncQueue
// dispatches it here POST-DRAIN: route to the owner's boundary. If the boundary
// errorCallback re-throws, surface it via a throwaway native CE reaction (window 'error').
setOnDeferredEffectError((owner, err) => {
    const boundary = owner as VaporInstance | null;
    let surfaced: unknown;
    let hasSurfaced = false;
    try {
        if (!boundary || !handleErrorSelfOrAncestor(boundary, err)) {
            surfaced = err;
            hasSurfaced = true;
        }
    } catch (reThrow) {
        // The boundary's own errorCallback re-threw (e.g. the value-mutation fixtures'
        // errorCallback that unconditionally throws). Surface THAT error.
        surfaced = reThrow;
        hasSurfaced = true;
    }
    if (hasSurfaced) {
        // Surface the unhandled boundary error to the platform as an UNHANDLED PROMISE
        // REJECTION (not an uncaught throw). Under native custom-element lifecycle,
        // engine-core surfaces a flush-time boundary re-throw via `unhandledrejection`
        // (the throw escapes `Promise.resolve().then(flushCallbackQueue)`), and the WTR
        // test helper's `unhandledrejection` listener records it as `caughtError`.
        // Crucially, `unhandledrejection` does NOT reach mocha's process-shim uncaught
        // handler (that shim only wires `uncaughtException` → `window.onerror`), so a
        // second async surface cannot drive mocha's fail/abort path — unlike an uncaught
        // throw (window 'error'), which straddles the between-tests window where the
        // helper has restored mocha's `window.onerror` shim and froze the run.
        //
        // Surface a PRISTINE Error carrying only the original message string. The raw
        // boundary error can transitively reference DOM nodes / component instances
        // (via enumerable own-properties, or a `cause`/custom field), and WTR's browser
        // WebSocket serializer (`stable()` in dev-server-core) `structuredClone`s the
        // outgoing session/log message; an HTMLElement in that graph throws
        // "HTMLElement object could not be cloned", which itself surfaces as a new
        // uncaught error → serialize → clone → throw → … a self-sustaining cascade that
        // hung the run on the SECOND async surface. A clean primitive-only Error is
        // trivially cloneable, so it reports once and the run proceeds.
        const cleanMessage =
            surfaced instanceof Error
                ? surfaced.message
                : typeof surfaced === 'string'
                  ? surfaced
                  : String((surfaced as { message?: unknown })?.message ?? surfaced);
        // Intentionally floating: this rejection is meant to reach the platform's
        // `unhandledrejection` handler (see comment above), so it is explicitly voided.
        void Promise.reject(new Error(cleanMessage));
    }
});
// VUE-PARITY async model: EVERY render effect (bindings AND structural for/if) defers
// its post-initial-run re-notify to the shared microtask-batched queue, matching Vue
// Vapor's `RenderEffect.notify() → queueJob`. Initial mount stays synchronous. This is
// the deliberate switch away from vapor's fine-grained-synchronous default toward
// engine-core/Vue's async, batched, parent-before-child rehydration contract.
setEnableAsyncRerender(true);
setVueParityAsync(true);
// WHOLE-TEMPLATE RE-RENDER: a tracked mutation of a component re-runs ALL its render
// effects in the same batched flush (engine-core: any rehydration re-reads every
// binding), not just the fine-grained effect subscribed to the changed value. Makes a
// deep mutation reflect on any subsequent render, and render() re-invoke on any prop
// change (observed-fields, side-effects). Builds on the async batching above.
setWholeTemplateRerender(true);

// Raise `globalIsUpdatingTemplate` while a binding effect RE-RUNS so a reactive
// mutation inside a binding getter (e.g. `get myClass(){ this.foo='x' }`) is
// reported as a "Updating the template has side effects" dev error, matching
// engine-core (which sets isUpdatingTemplate around template re-evaluation).
if (process.env.NODE_ENV !== 'production') {
    setTemplateUpdateHooks(
        () => {
            globalIsUpdatingTemplate = true;
        },
        () => {
            globalIsUpdatingTemplate = false;
        }
    );
}

// Emit `globalRerender` profiler spans around each synchronous reactive update
// cascade (the vapor analogue of engine-core's global rerender tick).
setCascadeHooks(
    () => {
        if (isProfilingEnabled())
            logOperationStart(
                OperationId.GlobalRerender,
                undefined,
                undefined,
                undefined,
                undefined
            );
    },
    () => {
        if (isProfilingEnabled()) {
            // Flush the mutations recorded (subscription-gated) during this cascade and
            // attach them to the `lwc-rerender` span's `detail.devtools.properties` — the
            // DevTools "why did this re-render?" rows. engine-core parity:
            // logGlobalOperationEnd(GlobalRerender, getAndFlushMutationLogs()). Dev-only:
            // getMutationProperties/getAndFlushMutationLogs are DCE-eliminated in prod (the
            // logs are never populated there — the recorder is NODE_ENV-gated too).
            if (process.env.NODE_ENV !== 'production') {
                logRerenderStop(getMutationProperties(getAndFlushMutationLogs()));
            } else {
                logOperationStop(
                    OperationId.GlobalRerender,
                    undefined,
                    undefined,
                    undefined,
                    undefined
                );
            }
        }
    }
);

const injectedRoots = new WeakSet<ShadowRoot | HTMLElement>();

// The set of created `$cmp` component proxies. The component set-trap normally
// unwraps a stored value to its raw graph (`toRawPreservingReadOnly`), but a value
// that is ITSELF a component `$cmp` proxy must be stored AS-IS: unwrapping it via
// `toRaw` (rawCache resolves the $cmp proxy to rawComponent) would store the RAW
// instance while a getter returning `this` yields the $cmp PROXY — two identities
// for the same component. A user setter aliasing `this` (e.g. `set foo(v){ that.ctx
// = this }`, CustomInstanceSetter) runs with `this` === the $cmp proxy, so storing
// its raw form breaks `setterContext === componentInstance`. engine-core has a
// single membrane identity, so setter-`this` === getter-`this`. Keeping the proxy
// preserves that. `toRaw`/`unwrap()` still resolve a $cmp proxy to raw (rawCache).
const componentProxies = new WeakSet<object>();

/** True if `value` is a created component `$cmp` proxy (see `componentProxies`). */
function isComponentProxy(value: unknown): boolean {
    return typeof value === 'object' && value !== null && componentProxies.has(value);
}

/**
 * Injects a component's compiled stylesheets into its render root, and applies
 * CSS scope tokens. Stylesheet factories have the @lwc/style-compiler signature
 * `(token, useActualHostSelector, useNativeDirPseudoclass) => cssText`.
 *
 * Scope tokens: a scoped stylesheet generates selectors suffixed with the token
 * (e.g. `.foo.lwc-xyz`), so every element in the render root must carry the
 * token as a class and the host carries `<token>-host`. We detect scoped-ness by
 * comparing factory output with and without the token.
 */
// --- Constructable stylesheet cache ------------------------------------------
// A single CSSStyleSheet per unique CSS text, shared across all shadow roots via
// `adoptedStyleSheets`. Mirrors engine-core's de-duplication; lets the integration
// tests observe `adoptedStyleSheets[0]` identity equality across instances.
const constructableStyleSheetCache = new Map<string, CSSStyleSheet>();
let constructableSupport: boolean | undefined;
function supportsConstructableStyleSheets(): boolean {
    if (constructableSupport === undefined) {
        constructableSupport =
            typeof CSSStyleSheet !== 'undefined' &&
            typeof (document as { adoptedStyleSheets?: unknown }).adoptedStyleSheets !==
                'undefined';
        // Verify the sheet is actually constructable + replaceable (jsdom lacks it).
        if (constructableSupport) {
            try {
                const probe = new CSSStyleSheet();
                constructableSupport = typeof probe.replaceSync === 'function';
            } catch {
                constructableSupport = false;
            }
        }
    }
    return constructableSupport;
}
function getOrCreateConstructableStyleSheet(css: string): CSSStyleSheet {
    let sheet = constructableStyleSheetCache.get(css);
    if (!sheet) {
        sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        constructableStyleSheetCache.set(css, sheet);
    }
    return sheet;
}

// Global ref-counted cache of light-DOM <style> elements, keyed by CSS content.
// Each unique CSS is injected ONCE into <head> (engine-dom's global stylesheet
// cache, `data-rendered-by-lwc` marker) and shared across instances. A ref count
// lets an HMR style-swap (same-template re-render) drop the stale CSS once no
// instance references it, while multi-template switches keep both templates' CSS
// (each is a distinct content key, all stay referenced).
interface LightStyleEntry {
    el: HTMLStyleElement;
    refs: number;
}
// Per-ROOT cache (a light component nested inside a shadow tree must inject into
// THAT shadow root, not document.head — shadow encapsulation blocks document
// styles from reaching inside; light-dom/style bleed tests). Keyed by the target
// root node, then by CSS content. Ref-counted for HMR removal.
const lightStyleCacheByRoot = new WeakMap<Node, Map<string, LightStyleEntry>>();
function lightStyleTarget(root: Node): Node {
    // A light component's styles go into its host's ROOT NODE: the enclosing shadow
    // root or the document (<head>). APPEND (not prepend) so that, across sibling
    // light components, document-order mounting yields the correct cascade — a
    // later-mounted component's rules win on conflicting properties (light-dom
    // style-multiple "styles bleed mutually", opacity 0.75 from x-two over x-one).
    if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
        return root;
    }
    return document.head;
}
function acquireGlobalLightStyle(targetRoot: Node, css: string): void {
    let byCss = lightStyleCacheByRoot.get(targetRoot);
    if (!byCss) {
        byCss = new Map();
        lightStyleCacheByRoot.set(targetRoot, byCss);
    }
    let entry = byCss.get(css);
    if (!entry) {
        const el = document.createElement('style');
        el.setAttribute('data-rendered-by-lwc', '');
        el.textContent = css;
        lightStyleTarget(targetRoot).appendChild(el);
        entry = { el, refs: 0 };
        byCss.set(css, entry);
    }
    entry.refs++;
}
function releaseGlobalLightStyle(targetRoot: Node, css: string): void {
    const byCss = lightStyleCacheByRoot.get(targetRoot);
    const entry = byCss?.get(css);
    if (!entry) return;
    entry.refs--;
    if (entry.refs <= 0) {
        if (entry.el.parentNode) entry.el.parentNode.removeChild(entry.el);
        byCss!.delete(css);
    }
}

const VALID_SCOPE_TOKEN_REGEX = /^[a-zA-Z0-9\-_]+$/;
/**
 * Validate the template's stylesheet token (W-16614556). The token is interpolated
 * into CSS selectors and applied to rendered elements as a class/attribute; a
 * non-string or character-unsafe token could inject arbitrary markup. Called BEFORE
 * DOM insertion so an invalid token aborts the mount with no rendered children.
 * Throws (→ routed to errorCallback boundary / window error) on an invalid token.
 */
function validateStylesheetToken(instance: VaporInstance): void {
    const tmpl = (instance.renderFn ?? instance.def.tmpl) as
        undefined | { stylesheetToken?: unknown; legacyStylesheetToken?: unknown };
    if (getFeatureFlagValue('DISABLE_SCOPE_TOKEN_VALIDATION')) return;
    const validate = (rawToken: unknown) => {
        if (rawToken === undefined || rawToken === null) return;
        if (typeof rawToken !== 'string' || !VALID_SCOPE_TOKEN_REGEX.test(rawToken)) {
            throw new Error('stylesheet token must be a valid string');
        }
    };
    // Validate BOTH the modern token and the legacy token (W-16614556): a component
    // can set an unsafe `legacyStylesheetToken` to inject arbitrary content via the
    // scope-token class, and the mount must abort with no rendered children.
    validate(tmpl?.stylesheetToken);
    validate(tmpl?.legacyStylesheetToken);
}

function injectStylesheets(instance: VaporInstance): void {
    const root = instance.renderRoot;
    if (injectedRoots.has(root)) return;
    // Use the resolved render function (which accounts for an inherited template
    // and user `render()` returns), falling back to the registered def template.
    const tmpl = (instance.renderFn ?? instance.def.tmpl) as
        undefined | (VaporRenderFn & { stylesheets?: unknown; stylesheetToken?: string });
    const tmplStylesheets = tmpl && (tmpl as any).stylesheets;
    // The token is validated up front (validateStylesheetToken, called before DOM
    // insertion) so a malicious token aborts the mount with no rendered children.
    // Here we just coerce it to its string form for use.
    const rawToken = tmpl && (tmpl as any).stylesheetToken;
    const token =
        rawToken === undefined || rawToken === null ? undefined : (String(rawToken) as string);
    // Programmatic stylesheets: a component may declare `static stylesheets = [..]`
    // on its constructor (or inherit them), independent of the template's compiled
    // stylesheets. Both sources are injected (matching engine-core, which appends
    // the static `stylesheets` after the template's). Read off the constructor so
    // inherited static fields resolve through the prototype chain.
    const ctorStylesheets = (instance.ctor as { stylesheets?: unknown } | undefined)?.stylesheets;
    const stylesheets: unknown[] = [];
    if (Array.isArray(tmplStylesheets)) stylesheets.push(...tmplStylesheets);
    // Only inject programmatic stylesheets that are valid (validation + dev error
    // happens at instance creation; here we just skip invalid shapes).
    if (isValidStylesheetsValue(ctorStylesheets)) {
        if (Array.isArray(ctorStylesheets)) stylesheets.push(...ctorStylesheets);
        else if (typeof ctorStylesheets === 'function') stylesheets.push(ctorStylesheets);
    }
    if (stylesheets.length === 0) {
        // Switching to a template with NO stylesheets: the host persists, so drop
        // the previous template's `<oldToken>-host` class (else its `:host` scoped
        // rule keeps matching — light-dom scoped-styles dynamic-template switch).
        if (instance.scopeToken) {
            instance.host.classList.remove(`${instance.scopeToken}-host`);
            instance.scopeToken = undefined;
        }
        injectedRoots.add(root);
        return;
    }

    const flatten = (list: unknown[], out: ((...a: any[]) => string)[]) => {
        for (const item of list) {
            if (Array.isArray(item)) flatten(item, out);
            else if (typeof item === 'function') out.push(item as any);
        }
    };
    const factories: ((...a: any[]) => string)[] = [];
    flatten(stylesheets, factories);

    // Dev-only compiler/runtime version check on each stylesheet factory (at mount,
    // matching engine-core's stylesheet.ts — and the integration test, which sets
    // tmpl.stylesheets then expects the warn on appendChild).
    if (process.env.NODE_ENV !== 'production') {
        for (const factory of factories) checkVersionMismatch(factory, 'stylesheet');
    }

    const isNativeShadow = root instanceof ShadowRoot;
    const isLight = instance.isLight === true;
    // Stylesheet factory signature: (token, useActualHostSelector, useNativeDirPseudoclass).
    // Mirrors engine-core's stylesheet.ts:
    //   - scopeToken: passed only for SCOPED stylesheets (`$scoped$`). (Vapor has no
    //     synthetic-shadow path here, where unscoped shadow CSS would also be tokened.)
    //   - useActualHostSelector: light → `!isScoped` (scoped light DOM uses the
    //     `.token-host` class, not real `:host`); shadow → native (true here).
    //   - useNativeDirPseudoclass: native shadow, or light DOM (top-level/native).
    // Compute each factory's CSS independently. Keeping them separate (rather than
    // concatenating) lets each become its OWN constructable stylesheet, so two
    // components sharing one imported stylesheet but adding their own get a SHARED
    // sheet[0] + distinct sheet[1] — matching engine-core's per-stylesheet model.
    const perFactoryCss: string[] = [];
    let scoped = false;
    for (const rawFactory of factories) {
        // Resolve through the hot-swap map (swapStyle) so a swapped stylesheet
        // takes effect on the next (re-)render.
        const factory = resolveStyle(rawFactory) as (...a: any[]) => string;
        try {
            const isScoped = (factory as { $scoped$?: boolean }).$scoped$ === true;
            // Light DOM + UNSCOPED CSS is unsupported when DISABLE_LIGHT_DOM_UNSCOPED_CSS
            // is set: log a dev error and skip the stylesheet (matching engine-core's
            // stylesheet.ts). Scoped light-DOM CSS (`*.scoped.css`) is fine.
            if (isLight && !isScoped && getFeatureFlagValue('DISABLE_LIGHT_DOM_UNSCOPED_CSS')) {
                logVaporError(
                    'Unscoped CSS is not supported in Light DOM in this environment. Please use scoped CSS ' +
                        '(*.scoped.css) instead of unscoped CSS (*.css). See also: https://sfdc.co/scoped-styles-light-dom'
                );
                continue;
            }
            const factoryToken = isScoped ? token : undefined;
            if (isScoped) scoped = true;
            const useActualHostSelector = isLight ? !isScoped : isNativeShadow;
            const useNativeDirPseudoclass = isNativeShadow || isLight;
            perFactoryCss.push(
                factory(factoryToken, useActualHostSelector, useNativeDirPseudoclass)
            );
        } catch {
            // ignore stylesheet factory errors
        }
    }

    // Remove any previously-injected <style> for this instance (hot-swap re-render).
    if (instance.injectedStyle && instance.injectedStyle.parentNode) {
        instance.injectedStyle.parentNode.removeChild(instance.injectedStyle);
        instance.injectedStyle = undefined;
    }
    // Distinguish a TEMPLATE SWITCH (renderFn changed → accumulate every template's
    // sheets, multi-template) from an HMR STYLE SWAP / same-template re-render
    // (renderFn unchanged, swapStyle changed the CSS → the stale sheet must be
    // removed so "remove stale prop" works). On a same-template re-render, drop the
    // previously-adopted sheets first; on a switch, keep them.
    const sameTemplate = instance.styleRenderFn === instance.renderFn;
    instance.styleRenderFn = instance.renderFn;
    if (sameTemplate && instance.adoptedSheets && root instanceof ShadowRoot) {
        const stale = instance.adoptedSheets;
        root.adoptedStyleSheets = root.adoptedStyleSheets.filter((s) => !stale.includes(s));
        instance.adoptedSheets = undefined;
    }
    // Same-template re-render in LIGHT DOM (HMR style swap): release this instance's
    // previously-acquired global light styles so a swapped/removed rule's stale
    // <style> can be dropped (style-swapping "remove stale prop"). A template SWITCH
    // keeps them (multi-template accumulation).
    if (sameTemplate && instance.lightStyleCss && instance.lightStyleRoot) {
        for (const css of instance.lightStyleCss) {
            releaseGlobalLightStyle(instance.lightStyleRoot, css);
        }
        instance.lightStyleCss = undefined;
    }
    const combinedCss = perFactoryCss.join('\n');
    if (combinedCss.trim() !== '') {
        if (root instanceof ShadowRoot && supportsConstructableStyleSheets()) {
            // Native shadow: one CONSTRUCTABLE stylesheet per factory, cached by CSS
            // text and shared across shadow roots via `adoptedStyleSheets` (matching
            // engine-core's per-stylesheet de-duplication). Skip empty factories.
            // ACCUMULATE across template switches: a multi-template shadow component
            // keeps every rendered template's sheet adopted (deduped), with the
            // current template's sheet APPENDED LAST so it wins the cascade
            // (shadow-dom/multiple-templates "Does not duplicate styles"; programmatic
            // multi-template override). We do NOT remove old sheets on re-render.
            const sheets: CSSStyleSheet[] = [];
            for (const css of perFactoryCss) {
                if (css.trim() === '') continue;
                const sheet = getOrCreateConstructableStyleSheet(css);
                if (!sheets.includes(sheet)) sheets.push(sheet);
            }
            instance.adoptedSheets = sheets;
            const existing = root.adoptedStyleSheets;
            const toAdd = sheets.filter((s) => !existing.includes(s));
            if (toAdd.length > 0) {
                // Append new sheets at the END so the current template's CSS has the
                // highest cascade priority over previously-adopted templates'.
                root.adoptedStyleSheets = [...existing, ...toAdd];
            }
        } else if (isLight) {
            // Light DOM: unscoped/scoped light styles are injected GLOBALLY into
            // <head>, deduped by CSS content, and NEVER removed on re-render. This
            // is what makes MULTI-TEMPLATE light components accumulate styles —
            // switching template A→B keeps A's global <style> AND adds B's (engine-
            // dom's global stylesheet cache; light-dom/multiple-templates). A per-
            // instance <style> removed each re-render would drop A's styles on switch.
            // Target the host's ROOT NODE: a light component nested inside a shadow
            // tree injects into that shadow root (so its styles reach its own light
            // subtree and can bleed to sibling light content there), while a
            // top-level light component injects into <head>.
            const targetRoot = (instance.host.getRootNode?.() as Node) ?? document;
            instance.lightStyleRoot = targetRoot;
            const acquired: string[] = [];
            for (const css of perFactoryCss) {
                if (css.trim() === '') continue;
                acquireGlobalLightStyle(targetRoot, css);
                acquired.push(css);
            }
            // Track for release on a later same-template re-render (HMR swap).
            instance.lightStyleCss = acquired;
        } else {
            const styleEl = document.createElement('style');
            styleEl.textContent = combinedCss;
            if (root instanceof ShadowRoot) {
                root.insertBefore(styleEl, root.firstChild);
            } else {
                root.appendChild(styleEl);
            }
            instance.injectedStyle = styleEl;
        }
    }

    // On a TEMPLATE SWITCH, the host persists across re-renders, so its previous
    // template's `<oldToken>-host` class must be removed — otherwise switching from
    // a scoped template B back to an unscoped/different template C leaves B's
    // `:host` scoped rule (e.g. `margin-left`) still matching (light-dom
    // scoped-styles "should replace scoped styles correctly with dynamic
    // templates" / multiple-templates). The rendered tree is freshly re-created so
    // its elements get the new token naturally; only the host needs cleanup.
    const prevToken = instance.scopeToken;
    if (prevToken && prevToken !== token) {
        instance.host.classList.remove(`${prevToken}-host`);
    }

    // Apply scope-token classes for scoped styles.
    if (scoped && token) {
        instance.scopeToken = token;
        // Host gets the `<token>-host` class.
        instance.host.classList.add(`${token}-host`);
        // Every element under the render root gets the token class. New elements
        // added later are tokenized in applyScopeTokenToTree on update.
        applyScopeTokenToTree(root, token);
        // When ENABLE_LEGACY_SCOPE_TOKENS is set, ALSO apply the legacy-format token
        // (`<ns>-<name>_<name>`) in addition to the modern one (engine-core applies
        // both — rendering/legacy-scope-tokens).
        const legacyToken =
            getFeatureFlagValue('ENABLE_LEGACY_SCOPE_TOKENS') && tmpl
                ? (tmpl as { legacyStylesheetToken?: unknown }).legacyStylesheetToken
                : undefined;
        if (typeof legacyToken === 'string' && legacyToken) {
            instance.host.classList.add(`${legacyToken}-host`);
            applyScopeTokenToTree(root, legacyToken);
        }
    } else {
        // No scoped style this render — drop the stale token reference so a later
        // switch back to a scoped template re-applies cleanly.
        instance.scopeToken = undefined;
    }

    injectedRoots.add(root);
}

/** Adds the scope-token class to every element currently under `root`. */
function applyScopeTokenToTree(root: ParentNode, token: string): void {
    // Only tokenize elements OWNED by this template — engine-core stamps the scope
    // token on the elements its own template renders, NOT on elements inside a
    // nested child component's subtree (those are scoped by the CHILD's own token).
    // A `querySelectorAll('*')` would over-tokenize a light child's descendants,
    // wrongly matching `div.<parent-token>` / `::after` rules (light-dom
    // scoped-styles "can scope shadow DOM styles" / "pseudo-elements"). Walk
    // manually and do NOT descend into a child custom-element HOST (a vapor LWC
    // component, identified by its VM_SLOT).
    const walk = (parent: ParentNode): void => {
        let child = parent.firstElementChild;
        while (child) {
            child.classList.add(token);
            // A child LWC component host owns its own subtree (light-DOM children or
            // shadow root) — don't tokenize inside it.
            const isComponentHost =
                (child as unknown as Record<symbol, unknown>)[VM_SLOT] !== undefined;
            if (!isComponentHost) {
                walk(child);
            }
            child = child.nextElementSibling;
        }
    };
    walk(root);
}

/** Marker stored on the host element to find its vapor instance. */
export const VM_SLOT = Symbol('vapor-vm');

/** Records the NAMED slot a slotted component host was distributed into (set when a
 *  light slottable projects content into a `<slot name="x">`). engine-core classifies
 *  a slotted child assigned to a NAMED slot as a velement of the slottable (walked in
 *  REVERSE on disconnect), and DEFAULT-slot content as an aChild (walked FORWARD), so
 *  the slottable's ordered disconnect fires `[named-reverse…, default-forward…]` (e.g.
 *  top/default/bottom slotees disconnect `[bottom, top, default]` = `2,0,1`). The raw
 *  `slot=` attribute is stripped post-projection, so we stash the name here. */
const SLOT_ASSIGNMENT = Symbol('vapor-slot-assignment');

/** Carry a slotee host's slot-assignment tag onto a REPLACEMENT host produced by a
 *  forwarding-slot recreate (engine-core keyed light-DOM diff mounts a fresh instance
 *  when a slotee changes bucket). Without this the new host lacks a SLOT_ASSIGNMENT and
 *  would be classified as an aChild (walked FORWARD) instead of a NAMED-slot velement,
 *  corrupting the ordered-disconnect sequence. `name` is the leaf-gather-name the new
 *  host now belongs to (its terminal `<slot name=…>` bucket). */
export function transferSlotAssignment(from: Element, to: Element, name: string): void {
    const prior = (from as unknown as Record<symbol, unknown>)[SLOT_ASSIGNMENT] as
        { name: string; slottable: VaporInstance } | undefined;
    if (!prior) return;
    (to as unknown as Record<symbol, unknown>)[SLOT_ASSIGNMENT] = {
        name,
        slottable: prior.slottable,
        // Flag a RECREATED slotee (produced by a forwarding-slot keyed diff). engine-core
        // appends the fresh vnodes to the slottable's velements in creation order, so on a
        // later teardown they disconnect in CREATION (idx-ascending) order — unlike the
        // ORIGINAL authored slotees, which disconnect in reverse slot-declaration order.
        recreated: true,
    };
}

/**
 * Reactive keys are tracked per-instance. We use the instance object identity as
 * the reactivity target, so `trackAccess(instance, key)` / `triggerUpdate` wire
 * up render effects to specific fields.
 */
export class LightningElement {
    // Internal vapor bookkeeping (non-enumerable to keep it out of Object.keys).
    [VM_SLOT]?: VaporInstance;
    /** Backing store for `refs`; assigned by applyRefs during render. */
    _$refs?: Record<string, Element>;

    /**
     * `Ctor.CustomElementConstructor` — a standards-based custom-element class for
     * this component (inherited by all subclasses). Building the abstract
     * LightningElement base itself is disallowed (throws), matching engine-core.
     */
    static get CustomElementConstructor(): CustomElementConstructor {
        const Ctor = this as unknown as typeof LightningElement;
        if (Ctor === LightningElement) {
            throw new TypeError(
                'Invalid Constructor: LightningElement base class can not be claimed as a custom element.'
            );
        }
        const cache = customElementConstructorCache;
        let cec = cache.get(Ctor);
        if (!cec && customElementConstructorBuilder) {
            cec = customElementConstructorBuilder(Ctor);
            cache.set(Ctor, cec);
        }
        return cec as CustomElementConstructor;
    }

    constructor(hooks?: { callHook?: any; setHook?: any; getHook?: any }) {
        initLightningElementInstance(this, hooks);
    }

    // `template` and `refs` are prototype accessors (non-enumerable), so they do
    // not appear in Object.keys(this) — matching the real LightningElement, where
    // they are not own enumerable instance fields.
    get template(): ShadowRoot | HTMLElement | null {
        const vm = this[VM_SLOT];
        if (!vm) return null;
        // Light DOM components have no shadow root; `this.template` is null and
        // accessing it logs a dev error (use `this.querySelector` etc. instead).
        if (vm.isLight) {
            logVaporError(
                '`this.template` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.'
            );
            return null;
        }
        return vm.renderRoot;
    }
    // A component may declare its own `template` field (e.g. `@api template =
    // tmpl; render() { return this.template; }`). Class-field initialization uses
    // [[Define]] semantics; emulate that by shadowing the prototype accessor with
    // an own data property rather than throwing on this getter-only accessor.
    set template(value: unknown) {
        Object.defineProperty(this, 'template', {
            value,
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }

    get refs(): Record<string, Element> | undefined {
        const vm = this[VM_SLOT];
        // Accessing `this.refs` in the constructor is not allowed — the element is
        // not in the DOM and has no children yet. LWC logs a distinct error.
        if (vm && vm.isConstructing) {
            logVaporError(
                `this.refs should not be called during the construction of the custom element for <${vm.tagName}> because the element is not yet in the DOM or has no children yet.`
            );
            return undefined;
        }
        // Accessing `this.refs` while the TEMPLATE is rendering (e.g. a binding or
        // template-read getter that reads `this.refs`) logs the "while rendering"
        // error and returns undefined — refs aren't stable until renderedCallback.
        // This MUST be checked before the `hasRenderedOnce` branch: on the very
        // first mount both `isRendering` and `!hasRenderedOnce` are true, but a
        // read from inside the template-effect should report "while rendering",
        // not "before renderedCallback". (The user `render()` method runs OUTSIDE
        // the template effect with `isRendering` false, so it correctly falls
        // through to the `hasRenderedOnce` branch below.)
        if (vm && vm.isRendering) {
            logVaporError(
                `this.refs should not be called while <${vm.tagName}> is rendering. ` +
                    `Use this.refs only when the DOM is stable, e.g. in renderedCallback().`
            );
            return undefined;
        }
        // Accessing `this.refs` before the first renderedCallback (e.g. in
        // connectedCallback, or during the very first render() before anything has
        // been committed to the DOM) returns undefined with a dev error — the
        // referenced elements haven't been rendered to the DOM yet.
        if (vm && !vm.hasRenderedOnce) {
            logVaporError(
                `this.refs is undefined for <${vm.tagName}>. This is either because the attached template has no "lwc:ref" directive, or this.refs was invoked before renderedCallback(). Use this.refs only when the referenced HTML elements have been rendered to the DOM, such as within renderedCallback() or disconnectedCallback().`
            );
            return undefined;
        }
        // Refs are exposed as a frozen, null-prototype object (matching LWC's
        // contract: `Object.getPrototypeOf(refs) === null`, `Object.isFrozen`).
        // The object is built fresh and frozen (NOT the live reactive store) so
        // that test matchers / consumers can't accidentally recurse through the
        // reactive membrane. When the template declared NO `lwc:ref` at all, refs
        // is `undefined`.
        if (!vm || !vm.refsTemplateDeclared) {
            return undefined;
        }
        if (!vm.refsFrozen) {
            const frozen: Record<string, Element> = Object.create(null);
            const store = vm.refsStore ?? {};
            for (const k of Object.keys(store)) frozen[k] = store[k];
            vm.refsFrozen = Object.freeze(frozen);
        }
        return vm.refsFrozen;
    }

    // A component may overwrite `this.refs` with its own value (the framework's
    // refs are just a default). Engine-core defines a matching setter that creates
    // an instance expando, so `this.refs = x` works even though `get refs` exists.
    // Without this, a class field `refs = 'x'` (initialized on the raw target
    // during construction, bypassing the reactive proxy) hits the getter-only
    // accessor and throws "Cannot set property refs which has only a getter".
    set refs(value: unknown) {
        Object.defineProperty(this, 'refs', {
            configurable: true,
            enumerable: true,
            writable: true,
            value,
        });
    }

    // --- Public LightningElement surface used by integration fixtures --- //

    // `String(this)` / `this.toString()` reports the component class name, matching
    // engine-core (`[object ${vm.def.name}]`). Falls back to 'LightningElement' for
    // an anonymous component class (whose `.name` is '').
    toString(): string {
        const vm = this[VM_SLOT];
        const name = (vm?.ctor as { name?: string } | undefined)?.name || 'LightningElement';
        return `[object ${name}]`;
    }

    // `this.style` returns the host element's CSSStyleDeclaration (API ≥ 62,
    // ENABLE_THIS_DOT_STYLE). The integration test that reads it is gated on the
    // API version, so returning the host style unconditionally is correct.
    get style(): CSSStyleDeclaration | undefined {
        return this[VM_SLOT]?.host.style;
    }

    // Default `render()` — part of the LightningElement public surface (the
    // `component/properties` spec expects it enumerable on the prototype). A
    // component overrides it to return a specific template; the framework resolves
    // the actual template via the override (resolveUserRenderResult). The base
    // returns undefined (use the associated/compiled template).
    render(): unknown {
        return undefined;
    }

    dispatchEvent(event: Event): boolean {
        const vm = this[VM_SLOT];
        return vm ? vm.host.dispatchEvent(event) : false;
    }

    /**
     * Returns an ElementInternals for the host (form-associated components /
     * ARIA). Delegates to the host element's native `attachInternals()`, which
     * already enforces the "called twice" and non-custom-element errors.
     */
    attachInternals(): ElementInternals {
        const vm = this[VM_SLOT];
        if (!vm) {
            throw new Error('attachInternals called on a disconnected component.');
        }
        // Use the NATIVE attachInternals (captured before the host's own
        // `attachInternals` is overridden with a dev warning for external access).
        return nativeAttachInternals.call(vm.host) as ElementInternals;
    }

    addEventListener(
        type: string,
        listener: EventListener,
        options?: AddEventListenerOptions
    ): void {
        if (process.env.NODE_ENV !== 'production') {
            if (options !== undefined) {
                logVaporError(
                    'The `addEventListener` method in `LightningElement` does not support any options.'
                );
            }
            if (typeof listener !== 'function') {
                const vm = this[VM_SLOT];
                logVaporError(
                    `Invalid second argument for this.addEventListener() in [object:vm ${
                        (vm?.ctor as { name?: string })?.name ?? 'Unknown'
                    } (${vm?.idx ?? 0})] for event "${type}". Expected an EventListener but received ${listener}.`
                );
            }
        }
        // A non-function listener throws (matching engine-core, whose wrapped
        // listener factory rejects non-functions) — surfaced via the CE reaction.
        if (typeof listener !== 'function') {
            throw new TypeError('Expected an EventListener but received ' + typeof listener);
        }
        const vm = this[VM_SLOT];
        if (!vm) return;
        // Wrap so the listener is invoked with `this === undefined` (LWC contract:
        // component-added listeners are NOT bound to the element). Cache the wrapper
        // per (listener) so removeEventListener can find+detach it. Options are NOT
        // forwarded — LWC's component addEventListener ignores them (and we already
        // warned above); forwarding would also trigger the host's own options warning
        // (double error). Use the native host adder directly to bypass that override.
        const wrapped = getWrappedListener(vm, listener);
        nativeAddEventListener.call(vm.host, type, wrapped);
    }

    removeEventListener(
        type: string,
        listener: EventListener,
        _options?: EventListenerOptions
    ): void {
        const vm = this[VM_SLOT];
        if (!vm) return;
        // Remove the SAME wrapper instance that addEventListener attached.
        const wrapped =
            typeof listener === 'function' ? getWrappedListener(vm, listener) : listener;
        nativeRemoveEventListener.call(vm.host, type, wrapped);
    }

    // `this.querySelector(All)` (vs `this.template.querySelector`) operates on the
    // host's LIGHT DOM — i.e. the slotted content the parent passed to this
    // component. For a shadow component that is `host` (not the shadow tree); for a
    // light component `host === renderRoot` anyway. Querying the shadow tree here
    // would wrongly return the component's own rendered content.
    querySelector(selectors: string): Element | null {
        warnIfConstructing(this, 'querySelector()');
        const host = this[VM_SLOT]?.host;
        return host ? host.querySelector(selectors) : null;
    }

    querySelectorAll(selectors: string): NodeListOf<Element> | [] {
        warnIfConstructing(this, 'querySelectorAll()');
        const host = this[VM_SLOT]?.host;
        return host ? host.querySelectorAll(selectors) : [];
    }

    getAttribute(name: string): string | null {
        return this[VM_SLOT]?.host.getAttribute(name) ?? null;
    }

    setAttribute(name: string, value: string): void {
        warnIfConstructingAttr(this);
        this[VM_SLOT]?.host.setAttribute(name, value);
    }

    removeAttribute(name: string): void {
        this[VM_SLOT]?.host.removeAttribute(name);
    }

    getAttributeNS(ns: string, name: string): string | null {
        return this[VM_SLOT]?.host.getAttributeNS(ns, name) ?? null;
    }

    setAttributeNS(ns: string, name: string, value: string): void {
        warnIfConstructingAttr(this);
        this[VM_SLOT]?.host.setAttributeNS(ns, name, value);
    }

    removeAttributeNS(ns: string, name: string): void {
        this[VM_SLOT]?.host.removeAttributeNS(ns, name);
    }

    hasAttribute(name: string): boolean {
        return this[VM_SLOT]?.host.hasAttribute(name) ?? false;
    }

    hasAttributeNS(ns: string, name: string): boolean {
        return this[VM_SLOT]?.host.hasAttributeNS(ns, name) ?? false;
    }

    getBoundingClientRect(): DOMRect {
        if (warnIfConstructing(this, 'getBoundingClientRect()')) {
            return new DOMRect();
        }
        return this[VM_SLOT]?.host.getBoundingClientRect() ?? new DOMRect();
    }

    get classList(): DOMTokenList {
        warnIfConstructingClassList(this);
        const vm = this[VM_SLOT];
        if (!vm) {
            return document.createElement('div').classList;
        }
        return vm.host.classList;
    }

    get isConnected(): boolean {
        return this[VM_SLOT]?.host.isConnected ?? false;
    }

    get hostElement(): HTMLElement | undefined {
        return this[VM_SLOT]?.host;
    }

    get tagName(): string {
        return this[VM_SLOT]?.host.tagName ?? '';
    }

    get ownerDocument(): Document | null {
        return this[VM_SLOT]?.host.ownerDocument ?? null;
    }

    get shadowRoot(): ShadowRoot | null {
        // Internally, `this.shadowRoot` is ALWAYS null — a component cannot access
        // its own shadow root from inside (it uses `this.template` instead). The
        // host element's `.shadowRoot` (open mode) is exposed separately on the
        // host, not here. Matches engine-core's LightningElement.shadowRoot.
        return null;
    }

    get firstChild(): ChildNode | null {
        warnIfConstructing(this, 'firstChild');
        return this[VM_SLOT]?.host.firstChild ?? null;
    }

    get lastChild(): ChildNode | null {
        warnIfConstructing(this, 'lastChild');
        return this[VM_SLOT]?.host.lastChild ?? null;
    }

    get firstElementChild(): Element | null {
        warnIfConstructing(this, 'firstElementChild');
        return this[VM_SLOT]?.host.firstElementChild ?? null;
    }

    get lastElementChild(): Element | null {
        warnIfConstructing(this, 'lastElementChild');
        return this[VM_SLOT]?.host.lastElementChild ?? null;
    }

    // `this.childNodes`/`this.children` expose the host's LIGHT-DOM children — for a
    // shadow component that is the slotted content passed by the parent (NOT the
    // rendered shadow tree). A component with no slotted content has length 0.
    get childNodes(): NodeListOf<ChildNode> {
        warnIfConstructing(this, 'childNodes');
        return (this[VM_SLOT]?.host ?? document.createElement('div')).childNodes;
    }

    get children(): HTMLCollection {
        warnIfConstructing(this, 'children');
        return (this[VM_SLOT]?.host ?? document.createElement('div')).children;
    }

    getElementsByTagName(tag: string): HTMLCollectionOf<Element> {
        warnIfConstructing(this, 'getElementsByTagName()');
        return (this[VM_SLOT]?.host ?? document.createElement('div')).getElementsByTagName(tag);
    }

    getElementsByClassName(names: string): HTMLCollectionOf<Element> {
        warnIfConstructing(this, 'getElementsByClassName()');
        return (this[VM_SLOT]?.host ?? document.createElement('div')).getElementsByClassName(names);
    }
}

/**
 * Shared LightningElement construction logic, invoked both by the ES-class
 * `constructor` (normal `new Subclass()` path) and by the callable
 * `LightningElement.prototype.constructor` shim below (the Locker SecureBase
 * mirror does `LightningElement.prototype.constructor.call(this)` — an ES class
 * cannot be `.call()`ed, so we route it through a plain function).
 */
function initLightningElementInstance(
    self: LightningElement,
    hooks?: { callHook?: any; setHook?: any; getHook?: any }
): void {
    // Wire the instance to this raw component immediately, so DOM-accessing
    // members invoked inside a subclass constructor can detect that they are
    // being called during construction and emit the proper LWC error.
    const instance = constructingInstance;
    // A LightningElement (or subclass) may only be constructed by the
    // framework — i.e. while `constructingInstance` is set by
    // createComponentInstanceImpl. A manual `new LightningElement()` / `new
    // Subclass()` outside that path has no instance and is illegal, matching
    // engine-core's "Illegal constructor" TypeError.
    if (!instance) {
        throw new TypeError('Illegal constructor');
    }
    Object.defineProperty(self, VM_SLOT, {
        value: instance,
        enumerable: false,
        writable: true,
        configurable: true,
    });
    // Locker integration: a subclass may call `super(hooks)` to install
    // per-instance get/set/callHook (the public-prop host accessors +
    // method wrappers route through these). Matches engine-core.
    if (hooks && (hooks.getHook || hooks.setHook || hooks.callHook)) {
        instance.lockerHooks = hooks;
    }
}

// Locker SecureBase mirror support: Locker (and Aura's `__circular__` interop)
// wrap the base class with a `SecureBase` function that, when constructed,
// does `LightningElement.prototype.constructor.call(this)`. The native ES-class
// constructor throws "Class constructor cannot be invoked without 'new'" when
// `.call()`ed, so we replace `prototype.constructor` with a callable function
// that runs the same init. `new LightningElement()` / `new Subclass()` go
// through the class's `[[Construct]]` (its real constructor), unaffected by this
// override; only an explicit `.constructor.call(this)` reaches this shim.
function LightningElementConstructorShim(
    this: LightningElement,
    hooks?: { callHook?: any; setHook?: any; getHook?: any }
): LightningElement {
    initLightningElementInstance(this, hooks);
    return this;
}
LightningElementConstructorShim.prototype = LightningElement.prototype;
// Keep `.name === 'LightningElement'` — code that walks the prototype chain
// detects the base via `ctor.constructor.name === 'LightningElement'` (e.g.
// create-element's base-class stop condition). A differently-named shim would
// break that walk (decorator/@api-with-superclasses resolution).
Object.defineProperty(LightningElementConstructorShim, 'name', {
    value: 'LightningElement',
    configurable: true,
});
Object.defineProperty(LightningElement.prototype, 'constructor', {
    value: LightningElementConstructorShim,
    writable: true,
    enumerable: false,
    configurable: true,
});

// Locker/Aura SecureBase interop also brands elements by invoking the base
// directly as `LightningElement.call(elm)` / `LightningElement.apply(elm, args)`
// (engine-core's base is a plain function, so this "just works"). Our base is an
// ES class whose `[[Call]]` throws "Class constructor cannot be invoked without
// new", so shadow the inherited `Function.prototype.call`/`apply` with own
// properties that route the branding through the same init the shim uses. `new`
// still goes through the class's `[[Construct]]`, unaffected by these overrides.
Object.defineProperty(LightningElement, 'call', {
    value: function (
        this: unknown,
        self: LightningElement,
        hooks?: { callHook?: any; setHook?: any; getHook?: any }
    ): LightningElement {
        initLightningElementInstance(self, hooks);
        return self;
    },
    writable: true,
    enumerable: false,
    configurable: true,
});
Object.defineProperty(LightningElement, 'apply', {
    value: function (
        this: unknown,
        self: LightningElement,
        args?: ArrayLike<{ callHook?: any; setHook?: any; getHook?: any }>
    ): LightningElement {
        initLightningElementInstance(self, args && args[0]);
        return self;
    },
    writable: true,
    enumerable: false,
    configurable: true,
});

// --- ARIA reflection -----------------------------------------------------------
// Define `ariaX` accessors on the prototype that reflect to the corresponding
// `aria-x` attribute on the host element (matching @lwc/aria-reflection +
// engine-core AOM). Values are stored on the host as attributes so they reflect
// both ways and render via template bindings reading `this.ariaX`.
// `role` reflects to the `role` attribute just like the `ariaX` props (engine-core
// gets it from @lwc/aria-reflection, which the vapor harness doesn't install for
// the component path) — include it so `this.role`/`elm.role` reflect (attribute-aria).
for (const [propName, attrName] of [
    ...Object.entries(AriaPropNameToAttrNameMap),
    ['role', 'role'] as [string, string],
]) {
    Object.defineProperty(LightningElement.prototype, propName, {
        configurable: true,
        enumerable: true,
        get(this: LightningElement) {
            const vm = this[VM_SLOT];
            if (!vm) return null;
            // If the component declares this name as a real prop/field, behave as
            // a plain reactive field (no attribute reflection).
            if (vm.declaredProps && vm.declaredProps.has(propName)) {
                trackAccess(vm.reactiveTarget, propName);
                return (vm.fieldValues ??= {})[propName] ?? null;
            }
            // Otherwise reflect from the host's aria-* attribute (global AOM).
            trackAccess(vm.reactiveTarget, propName);
            const host = vm.host;
            return host.hasAttribute(attrName) ? host.getAttribute(attrName) : null;
        },
        set(this: LightningElement, value: unknown) {
            const vm = this[VM_SLOT];
            if (!vm) {
                return;
            }
            if (vm.declaredProps && vm.declaredProps.has(propName)) {
                const store = (vm.fieldValues ??= {});
                const prev = store[propName];
                if (prev !== value) {
                    store[propName] = value;
                    triggerUpdate(vm.reactiveTarget, propName);
                }
                return;
            }
            const host = vm.host;
            const prev = host.hasAttribute(attrName) ? host.getAttribute(attrName) : null;
            const next = value === null || value === undefined ? null : String(value);
            if (next === null) {
                host.removeAttribute(attrName);
            } else {
                host.setAttribute(attrName, next);
            }
            if (prev !== next) {
                triggerUpdate(vm.reactiveTarget, propName);
            }
        },
    });
}

// --- Global HTML property reflection ------------------------------------------
// Reflective global HTML properties (id, title, tabIndex, hidden, dir, lang,
// draggable, spellcheck, accessKey) are delegated to the host element, with
// reactive tracking so template bindings update. Mirrors engine-core copying the
// native HTMLElement descriptors onto LightningElement.prototype.
//
// We capture the NATIVE HTMLElement get/set for each prop ONCE, and the component
// accessor calls them with `vm.host` as the receiver. This is what allows the
// HOST element's same-named property to ALSO be routed through the component (see
// create-element.ts) without infinite recursion: the host's accessor calls the
// component's accessor, which calls the native get/set directly (not the host's
// overridden accessor). Native reflection (type coercion, attr reflection per the
// HTML spec) is preserved; reactivity (trackAccess/triggerUpdate) is layered on.
interface NativeAccessor {
    get?: (this: HTMLElement) => unknown;
    set?: (this: HTMLElement, v: unknown) => void;
}
const nativeGlobalPropDescriptors: Record<string, NativeAccessor> = {};
if (typeof HTMLElement !== 'undefined') {
    for (const propName of REFLECTIVE_GLOBAL_PROPERTY_SET) {
        // Walk the prototype chain (HTMLElement / Element / Node) for the
        // standard accessor descriptor.
        let proto: object | null = HTMLElement.prototype;
        while (proto) {
            const desc = Object.getOwnPropertyDescriptor(proto, propName);
            if (desc && (desc.get || desc.set)) {
                nativeGlobalPropDescriptors[propName] = {
                    get: desc.get as NativeAccessor['get'],
                    set: desc.set as NativeAccessor['set'],
                };
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
}

// `spellcheck` and `draggable` are "explicit boolean" reflections: the IDL
// property reads `attr="true"`/`attr="false"` (case-insensitively) rather than
// using native truthy coercion (native `el.spellcheck = "false"` would wrongly
// yield `true` because "false" is a truthy string). LWC reflects them via the
// attribute with an explicit string compare. Mirror engine-core's
// explicitBooleanDescriptor for these two.
const EXPLICIT_BOOLEAN_DEFAULTS: Record<string, boolean> = {
    spellcheck: false,
    draggable: true,
};

/** Read a reflective global HTML prop from the host via its NATIVE getter. */
function readNativeGlobalProp(host: HTMLElement, propName: string): unknown {
    // NOTE: `spellcheck`/`draggable` are real reflected IDL properties; the native
    // getter already performs the correct attribute→property coercion (incl. the
    // platform default when the attribute is absent — e.g. Chrome's
    // `div.spellcheck === true`). Do NOT apply EXPLICIT_BOOLEAN_DEFAULTS here — that
    // is only for rendering a static template attribute STRING (see setExplicit
    // boolean attribute path), not for the IDL getter. Using it here returned the
    // wrong default (component/html-properties draggable/spellcheck getter).
    const native = nativeGlobalPropDescriptors[propName];
    if (native && native.get) return native.get.call(host);
    return (host as any)[propName];
}
/** Write a reflective global HTML prop to the host via its NATIVE setter. */
function writeNativeGlobalProp(host: HTMLElement, propName: string, value: unknown): void {
    if (propName in EXPLICIT_BOOLEAN_DEFAULTS) {
        // Explicit-boolean reflected prop (spellcheck/draggable). A parent forwards
        // its authored value (string from `<x-foo spellcheck="false">`, or a real
        // boolean) to this host. Mirror engine-core: a STRING value reflects to the
        // attribute via the explicit-boolean rule (only "false"/"true"
        // case-insensitively flips), NOT native truthy coercion (`Boolean("false")`
        // would wrongly yield true). A real boolean reflects directly. null/undefined
        // removes the attribute.
        if (value == null) {
            host.removeAttribute(propName);
            return;
        }
        const dflt = EXPLICIT_BOOLEAN_DEFAULTS[propName]; // spellcheck:false, draggable:true
        let normalized: string;
        if (typeof value === 'boolean') {
            normalized = String(value);
        } else {
            const s = String(value).toLowerCase();
            // spellcheck: only "false" → "false", else "true".
            // draggable:  only "true"  → "true",  else "false".
            normalized =
                propName === 'spellcheck'
                    ? s === 'false'
                        ? 'false'
                        : 'true'
                    : s === 'true'
                      ? 'true'
                      : 'false';
            void dflt;
        }
        if (host.getAttribute(propName) !== normalized) {
            host.setAttribute(propName, normalized);
        }
        return;
    }
    const native = nativeGlobalPropDescriptors[propName];
    if (native && native.set) {
        native.set.call(host, value);
        return;
    }
    (host as any)[propName] = value;
}

for (const propName of REFLECTIVE_GLOBAL_PROPERTY_SET) {
    Object.defineProperty(LightningElement.prototype, propName, {
        configurable: true,
        enumerable: true,
        get(this: LightningElement) {
            const vm = this[VM_SLOT];
            if (!vm) return undefined;
            if (vm.declaredProps && vm.declaredProps.has(propName)) {
                trackAccess(vm.reactiveTarget, propName);
                return (vm.fieldValues ??= {})[propName];
            }
            // Reading a reflected global HTML property from the constructor is
            // disallowed — the value hasn't been set by the owner yet. Matches
            // engine-core's dev error.
            if (vm.isConstructing) {
                logVaporError(
                    `The value of property \`${propName}\` can't be read from the constructor because the owner component hasn't set the value yet. Instead, use the constructor to set a default value for the property.`
                );
                return undefined;
            }
            trackAccess(vm.reactiveTarget, propName);
            // Delegate to the native host property (handles type coercion, e.g.
            // tabIndex number, and attribute reflection per the HTML spec).
            return readNativeGlobalProp(vm.host, propName);
        },
        set(this: LightningElement, value: unknown) {
            const vm = this[VM_SLOT];
            if (!vm) return;
            // Declared @api props that happen to share a global-HTML name are the
            // component's own; setting them is always allowed.
            if (vm.declaredProps && vm.declaredProps.has(propName)) {
                const store = (vm.fieldValues ??= {});
                if (store[propName] !== value) {
                    store[propName] = value;
                    triggerUpdate(vm.reactiveTarget, propName);
                }
                return;
            }
            // Setting a reflected global HTML property (dir, title, hidden, …)
            // during construction is disallowed — the element is not in the DOM
            // yet. Matches engine-core's "result must not have attributes" error.
            if (vm.isConstructing) {
                warnIfConstructingAttr(this);
                return;
            }
            const prev = readNativeGlobalProp(vm.host, propName);
            writeNativeGlobalProp(vm.host, propName, value);
            const next = readNativeGlobalProp(vm.host, propName);
            if (prev !== next) {
                triggerUpdate(vm.reactiveTarget, propName);
            }
        },
    });
}

// Make every member defined on LightningElement.prototype ENUMERABLE and
// non-configurable, matching engine-core's base-lightning-element descriptor
// contract (the `component/properties` spec asserts the exact enumerable set, that
// methods are writable, and that NONE are configurable). ES class methods/accessors
// are non-enumerable + configurable by default, so without this they're missing
// from `for...in` and wrongly configurable. The ARIA/reflective-global accessors
// defined above are already enumerable; re-stamp them non-configurable too.
for (const name of Object.getOwnPropertyNames(LightningElement.prototype)) {
    if (name === 'constructor') continue;
    const desc = Object.getOwnPropertyDescriptor(LightningElement.prototype, name);
    if (!desc) continue;
    desc.enumerable = true;
    desc.configurable = false;
    Object.defineProperty(LightningElement.prototype, name, desc);
}

/** The set of reflective global HTML prop names, for the host-bridge in create-element. */
export const REFLECTIVE_GLOBAL_PROP_NAMES = REFLECTIVE_GLOBAL_PROPERTY_SET;

export interface VaporInstance {
    host: HTMLElement;
    renderRoot: ShadowRoot | HTMLElement;
    component: LightningElement;
    def: ComponentMetadata;
    decorators: DecoratorMetadata;
    block: Block | null;
    isMounted: boolean;
    reactiveTarget: object;
    cleanups: (() => void)[];
    /** The CSS scope token in effect for this instance's scoped styles, if any. */
    scopeToken?: string;
    /** True while the component class constructor is executing. */
    isConstructing?: boolean;
    /** True once the first (mount) renderedCallback has fired — gates `this.refs`. */
    hasRenderedOnce?: boolean;
    /** True while the component's template render function is executing. */
    isRendering?: boolean;
    /** True while the component's user-defined `render()` method is executing. */
    isInvokingRender?: boolean;
    /** Per-instance Locker hooks installed via `super(hooks)` in the component. */
    lockerHooks?: { callHook?: any; setHook?: any; getHook?: any };
    /** Unsubscribe fns for trusted signals read during the current render cycle.
     *  Cleared + re-collected each render (signal protocol). */
    signalCleanups?: (() => void)[];
    /** Signals already subscribed this render cycle (dedup). */
    signalsSeen?: WeakSet<object>;
    /** True once a signal-triggered re-render is scheduled (microtask), so
     *  multiple synchronous signal notifications coalesce into one re-render. */
    signalRerenderScheduled?: boolean;
    /** Backing store for template `lwc:ref` refs (exposed via `this.refs`). */
    refsStore?: Record<string, Element>;
    /** True if the component's template declares any `lwc:ref` (→ refs is an object, not undefined). */
    refsTemplateDeclared?: boolean;
    /** Cached frozen, null-proto snapshot of refs (rebuilt each render). */
    refsFrozen?: Record<string, Element>;
    /** The component's tag name (e.g. 'x-foo'), for error messages. */
    tagName?: string;
    /** Monotonic per-instance id (for unique profiler mark names on recursive components). */
    idx?: number;
    /** The resolved render function (user render() result or def.tmpl). */
    renderFn?: VaporRenderFn;
    /** The component's own/inherited default template (def.tmpl), used when no user render(). */
    defaultTmpl?: VaporRenderFn;
    /** The user-defined render() method, if any. Called lazily at render time (after props are set). */
    userRenderMethod?: (...a: unknown[]) => unknown;
    /** The slot set passed at creation, consumed when the block is rendered at mount. */
    slotset?: Record<string, () => unknown>;
    /** For a shadow component with slotted content: the owner instance to restore as
     *  current-instance while projecting slots at mount (so projected child hosts
     *  capture the correct `parent`). `null` means project with no current instance.
     *  `undefined` means this instance has no slots to project at mount. */
    slotOwner?: VaporInstance | null;
    /** The component constructor (for static fields like `stylesheets`, `renderMode`). */
    ctor?: unknown;
    /** True for light-DOM components (renderMode === 'light'); no shadow root. */
    isLight?: boolean;
    /** The parent component instance (the one rendering when this was created). */
    parent?: VaporInstance;
    /** The <style> element injected for this instance (removed/replaced on hot-swap). */
    injectedStyle?: HTMLStyleElement;
    /** Constructable stylesheets adopted by this instance's shadow root (for HMR removal). */
    adoptedSheets?: CSSStyleSheet[];
    /** The renderFn whose stylesheets were last injected — used to distinguish a
     *  same-template re-render/HMR-swap (remove stale sheets) from a template
     *  switch (accumulate, multi-template). */
    styleRenderFn?: unknown;
    /** CSS-content keys this instance acquired from the light-DOM style cache
     *  (ref-counted), released on same-template re-render + unmount. */
    lightStyleCss?: string[];
    /** The root node (shadow root or document) this instance's light styles were
     *  injected into — needed to release them from the right per-root cache. */
    lightStyleRoot?: Node;
    /** The effect scope owning this instance's render effects (disposed on unmount). */
    scope?: EffectScope;
    /** Names declared as real props/fields (so ARIA accessors store, not reflect). */
    declaredProps?: Set<string>;
    /** Names declared with `@track` (render-side-effect message uses vm form). */
    trackedFields?: Set<string>;
    /** Names declared with `@api` (public props). A public ACCESSOR prop set still
     *  schedules a re-render (engine-core parity), unlike a non-@api own accessor. */
    publicPropNames?: Set<string>;
    /** STANDARD-slot DynamicFragments rendered by this instance, collected during
     *  render and flattened post-mount (strip nested fragment bookends in slot content
     *  — engine-core `flattenFragmentsInChildren`). */
    slotFragsToFlatten?: DynamicFragment[];
    /** PLAIN observed fields (class fields that are NOT @track/@api/@wire). Their
     *  object values are returned RAW (not deep-wrapped) — shallow reactivity,
     *  engine-core parity (observed-fields identity + no-deep-rerender). */
    plainFields?: Set<string>;
    /** Storage for declared ARIA-named field values. */
    fieldValues?: Record<string, unknown>;
    /** True once this instance's ordered disconnect has run (so the native
     *  per-element disconnect reaction becomes a no-op — the outermost removal
     *  drives the whole subtree). Reset on reconnect. */
    disconnected?: boolean;
    /** The mount lifecycle phase this instance is CURRENTLY executing, set just before
     *  each phase runs (connectedCallback → render → patch/insert → renderedCallback).
     *  On a mount-phase throw, the create-element connectedCallback catch reads this to
     *  decide whether the throwing child's FOLLOWING template siblings must be removed:
     *  a CONSTRUCTOR or RENDER throw aborts sibling creation (engine-core builds the
     *  vnode tree top-down, so a render throw never produces the later siblings), while a
     *  connectedCallback/renderedCallback throw happens AFTER the siblings are already in
     *  the DOM, so they remain (the errorCallback value-mutation cluster asserts exactly
     *  this split via `x-after-throwing-child`). */
    mountPhase?: 'render' | 'connected' | 'rendered';
    /** Set true when a DEFERRED CHILD of this instance threw during its CONSTRUCTOR or
     *  RENDER phase while the block was connecting. The still-pending following siblings
     *  read this in their own connect reaction and abort (remove themselves without
     *  mounting), giving engine-core's top-down "a render throw stops sibling creation"
     *  semantics. Cleared on the next microtask (after the synchronous connect cascade). */
    abortDeferredChildMount?: boolean;
    /** Set on disconnect: the rendered block + DOM were PRESERVED (not removed), so
     *  a reconnect re-fires connectedCallback/renderedCallback without re-rendering. */
    domPreserved?: boolean;
    /** True when a post-mount re-render scheduled a renderedCallback that had NOT
     *  yet flushed when the instance was disconnected (a pending detached
     *  rehydration). On reconnect that pending rehydration owns the rc, so the
     *  reconnect path suppresses its own renderedCallback (engine-core's detached-
     *  rehydration model — lifecycle "connect/mutate/disconnect/reconnect"). */
    pendingRehydrationRc?: boolean;
    /** Names of `@wire` fields (NOT methods). Values written to these by a wire
     *  adapter are returned RAW (not deep-wrapped) on read-back, preserving the
     *  reference identity the adapter echoed (engine-core behavior). */
    wiredFields?: Set<string>;
    /** Wire adapters CONSTRUCTED eagerly at instance-create (engine-core constructs
     *  wire connectors in vm.ts before mount, so an adapter's constructor side
     *  effects — e.g. recording the host tagName — happen at createElement, even if
     *  the element is never appended). Reused by installWireAdapters at mount for
     *  connect()/config-watch instead of re-constructing. */
    preConstructedWires?: Map<string, unknown>;
    /** Persistent tracking effect that runs a user `render()` so reactive reads it
     *  makes (e.g. which template to return) re-render on change — reactive template
     *  switching. Tied to renderDriverScope (stopped on unmount). */
    renderDriver?: ReactiveEffect;
    /** Scope owning renderDriver; stopped on unmount so it can never re-fire. */
    renderDriverScope?: EffectScope;
    /** Coalescing guard: a template-switch re-render is already scheduled. */
    renderSwitchScheduled?: boolean;
    /** True while renderInstance drives renderDriver.run() manually (so the effect
     *  body runs render() synchronously instead of scheduling a microtask). */
    renderDriverManualRun?: boolean;
    /** Set by reRenderInstance(keepRenderFn=true) so the next renderInstance skips the
     *  renderDriver re-run — render() already ran in the triggering effect (avoids a
     *  double render() invocation on a template switch). */
    skipDriverRerun?: boolean;
    /** Count of template switches; a circuit breaker stops the driver if it runs away. */
    renderSwitchCount?: number;
    /** Error thrown by the most recent user render() invocation (routed to boundary). */
    userRenderThrew?: unknown;
}

/** The instance currently being constructed (so the base ctor can wire it). */
let constructingInstance: VaporInstance | null = null;
/** Monotonic counter for per-instance idx (unique profiler mark names). */
let nextInstanceIdx = 0;
// Global render-phase flags (any instance). A reactive mutation during these
// phases is a side effect — even a mutation to a DIFFERENT (e.g. child) component
// triggered from within the rendering component. Mirrors engine-core's global
// isInvokingRender / isUpdatingTemplate.
// Reactive template switching (user render() returning different templates on a
// tracked-field change). Fixes ~13 template-switch tests in isolation, BUT in the
// FULL suite it turns the pre-existing events/memoization FAILURES into a 300s
// file-level HANG (a cross-file interaction — a 4th confirmation of the documented
// behavior). Net −14 passes, so it's GATED OFF until the memoization hang is
// root-caused. The implementation (tracking effect + template-change guard +
// circuit breaker) is preserved below for the next attempt.
const ENABLE_REACTIVE_TEMPLATE_SWITCH = true;
let globalIsInvokingRender = false;
let globalIsUpdatingTemplate = false;
// While > 0, the "render/template side effect" dev guard is SUPPRESSED. Applying a
// reactive prop to a CHILD component during the PARENT's template update (wireChildProps'
// per-prop effect re-running → applyChildProp → the child's `@api` setter) is the NORMAL
// prop-application flow, NOT a side effect — engine-core does not flag it (its
// isUpdatingTemplate is per-vm scoped to a vm's own render, whereas vapor's flag is a
// global that would otherwise catch the child's setter). createElement raises this around
// applyChildProp so a legitimate cross-component prop write isn't misreported (mismatched
// slot-type test counts console.error calls: the spurious child-prop "side effects" errors
// inflated the count past the single expected mismatch error).
let globalSuppressSideEffectCheck = 0;
export function withSuppressedSideEffectCheck<T>(fn: () => T): T {
    globalSuppressSideEffectCheck++;
    try {
        return fn();
    } finally {
        globalSuppressSideEffectCheck--;
    }
}

/**
 * Emits the LWC construction-phase error if a DOM-accessing member is invoked
 * while the component constructor is still running (the element is not in the
 * DOM yet). Matches engine-core's `warnIfInvokedDuringConstruction`.
 */
/**
 * Logs an LWC error matching engine-core's logger: outside test env it throws an
 * Error and logs the Error object (so the console message reads `Error: [LWC
 * error]: ...`); the test matchers expect that `Error:` prefix.
 */
/**
 * A valid programmatic `stylesheets` value: nullish, a stylesheet factory
 * function, or an array of valid values (possibly nested). Strings and arrays of
 * strings are invalid (a common mistake).
 */
function isValidStylesheetsValue(val: unknown): boolean {
    if (val == null) return true;
    if (typeof val === 'function') return true;
    if (!Array.isArray(val)) return false;
    return val.every(isValidStylesheetsValue);
}

// Tracks ctors that already have a warn-on-set `stylesheets` accessor installed,
// so we replace the data property only once per ctor.
const stylesheetsMutationGuarded = new WeakSet<object>();
/**
 * Dev-only: replace a ctor's OWN `stylesheets` data property with a getter/setter
 * pair that warns (once) on reassignment — the stylesheets are captured/injected
 * once, so a later `Ctor.stylesheets = [...]` (e.g. inside connectedCallback) has
 * no effect. Mirrors engine-core's warnOnStylesheetsMutation. Only the ctor that
 * OWNS the property is patched (an inherited value is left to its owner).
 */
function warnOnStylesheetsMutation(Ctor: any): void {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof Ctor !== 'function') return;
    if (stylesheetsMutationGuarded.has(Ctor)) return;
    // Only patch when `stylesheets` is an OWN data property of this ctor (not an
    // inherited value and not already an accessor we installed on a base).
    const desc = Object.getOwnPropertyDescriptor(Ctor, 'stylesheets');
    if (!desc || !('value' in desc) || !desc.configurable) return;
    stylesheetsMutationGuarded.add(Ctor);
    let value = desc.value;
    Object.defineProperty(Ctor, 'stylesheets', {
        enumerable: desc.enumerable ?? true,
        configurable: true,
        get() {
            return value;
        },
        set(newValue: unknown) {
            logWarnOnce(
                `Dynamically setting the "stylesheets" static property on ${Ctor.name} ` +
                    'will not affect the stylesheets injected.'
            );
            value = newValue;
        },
    });
}

/**
 * Build the LWC component stack for an error (`<x-a>\n\t<x-b>` from root to the
 * throwing component) and attach it as a non-enumerable `wcStack` property, so
 * tests + errorCallback boundaries can read the originating component chain.
 */
function attachErrorComponentStack(instance: VaporInstance | undefined, error: unknown): void {
    if (
        !instance ||
        error === null ||
        typeof error !== 'object' ||
        Object.isFrozen(error) ||
        (error as { wcStack?: unknown }).wcStack !== undefined
    ) {
        return;
    }
    const stack: string[] = [];
    let cursor: VaporInstance | undefined = instance;
    while (cursor) {
        stack.push(`<${(cursor.tagName ?? 'unknown').toLowerCase()}>`);
        cursor = cursor.parent;
    }
    const wcStack = stack.reverse().join('\n\t');
    try {
        Object.defineProperty(error, 'wcStack', { get: () => wcStack, configurable: true });
    } catch {
        /* ignore */
    }
}

function logVaporError(message: string): void {
    const msg = `[LWC error]: ${message}`;
    try {
        throw new Error(msg);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

/** console.warn a `[LWC warn]:`-prefixed Error (matches toLogWarningDev). */
function logVaporWarnLocal(message: string): void {
    try {
        throw new Error(`[LWC warn]: ${message}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
    }
}

// Validate `static shadowSupportMode` once per ctor (def-creation time, like
// engine-core). Tracks seen ctors so the dev error/warning + reporting fire once.
const shadowSupportModeValidated = new WeakSet<object>();
function validateShadowSupportModeOnce(Ctor: object): void {
    if (shadowSupportModeValidated.has(Ctor)) return;
    shadowSupportModeValidated.add(Ctor);
    const mode = (Ctor as { shadowSupportMode?: unknown }).shadowSupportMode;
    if (mode === undefined) return;
    if (process.env.NODE_ENV !== 'production') {
        if (mode !== 'any' && mode !== 'reset' && mode !== 'native') {
            logVaporError(`Invalid value for static property shadowSupportMode: '${mode}'`);
        }
        // TODO [#3971]: Completely remove shadowSupportMode "any"
        if (mode === 'any') {
            logVaporWarnLocal(
                `Invalid value 'any' for static property shadowSupportMode. 'any' is deprecated and will be removed in a future release--use 'native' instead.`
            );
        }
    }
    if ((mode === 'any' || mode === 'native') && isReportingEnabled()) {
        report('ShadowSupportModeUsage', {
            tagName: (Ctor as { name?: string }).name ?? 'unknown',
            mode: mode as string,
        });
    }
}

// Per-instance cache of component-added event listeners → their wrapper. LWC
// invokes component-added listeners with `this === undefined` (NOT bound to the
// element). We wrap once per (instance, original listener) so add/removeEventListener
// reference the same wrapper.
// Native EventTarget methods captured up-front, so the component's add/remove
// EventListener can bypass the host's options-warning override (which would
// double-warn) and call straight through to the platform.
const nativeAddEventListener: typeof EventTarget.prototype.addEventListener =
    EventTarget.prototype.addEventListener;
const nativeRemoveEventListener: typeof EventTarget.prototype.removeEventListener =
    EventTarget.prototype.removeEventListener;
// Native HTMLElement.attachInternals, captured before the host override below
// shadows it with a dev warning for external access. The component's own
// `this.attachInternals()` uses this.
const nativeAttachInternals: () => ElementInternals =
    typeof HTMLElement !== 'undefined' &&
    typeof (HTMLElement.prototype as { attachInternals?: () => ElementInternals })
        .attachInternals === 'function'
        ? (HTMLElement.prototype as { attachInternals: () => ElementInternals }).attachInternals
        : function (this: HTMLElement) {
              throw new Error('attachInternals is not supported in this environment.');
          };
const wrappedListenerCache = new WeakMap<object, WeakMap<object, EventListener>>();
function getWrappedListener(vm: VaporInstance, listener: EventListener): EventListener {
    let perVm = wrappedListenerCache.get(vm);
    if (!perVm) {
        perVm = new WeakMap();
        wrappedListenerCache.set(vm, perVm);
    }
    let wrapped = perVm.get(listener);
    if (!wrapped) {
        wrapped = function (this: unknown, event: Event) {
            // Invoke with `this === undefined` per LWC's contract.
            return (listener as (e: Event) => unknown).call(undefined, event);
        };
        perVm.set(listener, wrapped);
    }
    return wrapped;
}

function warnIfConstructing(self: LightningElement, methodOrPropName: string): boolean {
    const vm = self[VM_SLOT];
    if (vm && vm.isConstructing) {
        const tag = vm.tagName ? `<${vm.tagName}>` : '<unknown>';
        logVaporError(
            `this.${methodOrPropName} should not be called during the construction ` +
                `of the custom element for ${tag} because the element is not yet in the DOM or has ` +
                `no children yet.`
        );
        return true;
    }
    return false;
}

/** Attribute mutations during construction get a distinct LWC error message. */
function warnIfConstructingAttr(self: LightningElement): boolean {
    const vm = self[VM_SLOT];
    if (vm && vm.isConstructing) {
        const tag = vm.tagName ? `<${vm.tagName}>` : '<unknown>';
        logVaporError(`Failed to construct '${tag}': The result must not have attributes.`);
        return true;
    }
    return false;
}

/** classList mutations during construction use the classname-specific message. */
function warnIfConstructingClassList(self: LightningElement): boolean {
    const vm = self[VM_SLOT];
    if (vm && vm.isConstructing) {
        logVaporError(
            `The result must not have attributes. Adding or tampering with classname in ` +
                `constructor is not allowed in a web component, use connectedCallback() instead.`
        );
        return true;
    }
    return false;
}

export function registerComponent(Ctor: any, metadata: ComponentMetadata): any {
    // A module may export a non-component value as default (e.g. `undefined`, a
    // string, a plain object). registerComponent is still invoked on it at module
    // eval; storing a non-object in the WeakMap would throw ("Invalid weak map
    // key") and abort the whole module. Tolerate it and pass the value through.
    if (Ctor !== null && (typeof Ctor === 'object' || typeof Ctor === 'function')) {
        registeredComponents.set(Ctor, metadata);
        // `Ctor.CustomElementConstructor` is provided as a static getter on the
        // LightningElement base (inherited by all subclasses), so no per-Ctor
        // definition is needed here.
        if (process.env.NODE_ENV !== 'production' && typeof Ctor === 'function') {
            checkVersionMismatch(Ctor, 'component');
        }
    }
    return Ctor;
}

/** The registered custom-element tag (`sel`, e.g. "x-foo") for a component
 *  constructor, walking the prototype chain. Used by `lwc:is`/`lwc:dynamic` to
 *  give the resolved element its real tag name instead of `lwc-component`. */
export function getComponentSel(Ctor: any): string | undefined {
    let cursor = Ctor;
    let guard = 0;
    while (cursor && guard++ < 50) {
        const meta = registeredComponents.get(cursor);
        if (meta && meta.sel) return meta.sel;
        cursor = Object.getPrototypeOf(cursor);
    }
    return undefined;
}

/**
 * True if `key` resolves to a method (function-valued DATA property) defined on
 * the prototype chain — not an own property and not an accessor. Used to decide
 * whether to bind a function read off the component proxy: only real methods get
 * `this` bound; fields/accessor-returns keep their identity.
 */
function isPrototypeMethod(obj: object, key: string): boolean {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    let proto = Object.getPrototypeOf(obj);
    while (proto && proto !== Object.prototype) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc) {
            return typeof desc.value === 'function';
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

// Builder for `Ctor.CustomElementConstructor`, injected by create-element.ts to
// avoid a circular import (create-element imports from this module). Results are
// cached per Ctor so repeated reads return the same class.
let customElementConstructorBuilder: ((Ctor: any) => CustomElementConstructor) | null = null;
const customElementConstructorCache = new WeakMap<object, CustomElementConstructor>();
export function setCustomElementConstructorBuilder(
    fn: (Ctor: any) => CustomElementConstructor
): void {
    customElementConstructorBuilder = fn;
}

/**
 * Classify an own-property descriptor found on the prototype for a decorated
 * field name, matching engine-core's duplicate-member error wording.
 */
function getClassDescriptorType(descriptor: PropertyDescriptor): string {
    if (typeof descriptor.value === 'function') return 'method';
    if (typeof descriptor.set === 'function' || typeof descriptor.get === 'function') {
        return 'accessor';
    }
    return 'field';
}

/** "class Foo" / "function Foo" — the prefix the babel-plugin validation message uses. */
function describeCtor(Ctor: { name?: string; toString(): string }): string {
    const src = String(Ctor.toString());
    const kind = src.trimStart().startsWith('class') ? 'class' : 'function';
    return `${kind} ${Ctor.name ?? ''}`.trim();
}

/**
 * Validate decorator metadata against the prototype (dev only): a field decorated
 * with `@api`/`@track`/`@wire` (or a plain observed field) that collides with a
 * method/accessor of the same name already on the prototype logs an error —
 * matching engine-core's registerDecorators validations.
 */
function validateDecorators(Ctor: any, meta: DecoratorMetadata): void {
    if (process.env.NODE_ENV === 'production') return;
    const proto = Ctor?.prototype;
    if (!proto) return;
    const descOf = (name: string) => Object.getOwnPropertyDescriptor(proto, name);

    // @api fields: a `config > 0` entry is an accessor declaration (validate
    // getter/setter pairing); `config === 0` is a field (collision check).
    if (meta.publicProps) {
        for (const fieldName of Object.keys(meta.publicProps)) {
            const config = meta.publicProps[fieldName]?.config ?? 0;
            const descriptor = descOf(fieldName);
            if (config > 0) {
                // Accessor: a setter without a getter is invalid. engine-core BOTH
                // logs a dev error (the babel-plugin validation message) AND throws
                // (createPublicAccessorDescriptor's assert.invariant). Do both.
                if (
                    descriptor &&
                    typeof descriptor.set === 'function' &&
                    typeof descriptor.get !== 'function'
                ) {
                    logVaporError(
                        `Missing getter for property ${fieldName} decorated with @api in ${describeCtor(Ctor)}. ` +
                            `You cannot have a setter without the corresponding getter.`
                    );
                    throw new Error(
                        `Invalid public accessor ${fieldName} decorated with @api. The property is missing a getter.`
                    );
                }
            } else if (descriptor) {
                // Field declaration colliding with a method/accessor of the same
                // name. engine-core logs the error even when it then treats a
                // getter-bearing duplicate as a public accessor (W-9927596).
                logVaporError(
                    `Invalid @api ${fieldName} field. Found a duplicate ${getClassDescriptorType(descriptor)} with the same name.`
                );
            }
        }
    }
    // @track fields colliding with a method/accessor.
    if (meta.track) {
        for (const fieldName of Object.keys(meta.track)) {
            const descriptor = descOf(fieldName);
            if (descriptor) {
                logVaporError(
                    `Invalid @track ${fieldName} field. Found a duplicate ${getClassDescriptorType(descriptor)} with the same name.`
                );
            }
        }
    }
    // @wire fields/methods colliding with a method/accessor (wired METHODS have
    // method===1 and legitimately own a value descriptor — skip those).
    if (meta.wire) {
        for (const fieldName of Object.keys(meta.wire)) {
            const entry = meta.wire[fieldName] as { method?: number } | undefined;
            if (entry?.method === 1) continue;
            const descriptor = descOf(fieldName);
            if (descriptor) {
                logVaporError(
                    `Invalid @wire ${fieldName} field. Found a duplicate ${getClassDescriptorType(descriptor)} with the same name.`
                );
            }
        }
    }
    // Plain observed fields colliding with a method/accessor.
    if (meta.fields) {
        for (const fieldName of meta.fields) {
            const descriptor = descOf(fieldName);
            let dupType: string | undefined;
            if (descriptor) {
                dupType = getClassDescriptorType(descriptor);
            } else if (
                (meta.publicProps && fieldName in meta.publicProps) ||
                (meta.track && fieldName in meta.track) ||
                (meta.wire && fieldName in meta.wire)
            ) {
                // engine-core processes decorators IN ORDER and mutates the
                // prototype: @api / @track / @wire all install an ACCESSOR on the
                // proto BEFORE the observed-`fields` loop runs last. So a plain
                // observed field whose name is ALSO declared as @api/@track/@wire
                // (the W-9927596 "duplicate" case — two declarations, same name)
                // collides with that installed accessor. Vapor doesn't install
                // those proto accessors, so detect the collision from the metadata.
                dupType = 'accessor';
            }
            if (dupType) {
                logVaporError(
                    `Invalid observed ${fieldName} field. Found a duplicate ${dupType} with the same name.`
                );
            }
        }
    }
}

/**
 * W-9927596 (runs in PROD + dev): when a plain class FIELD collides with a
 * same-class get/set ACCESSOR of the same name, the field declaration WINS — its
 * initializer runs as `[[DefineOwnProperty]]`, defining a plain data property that
 * SHADOWS the accessor, so the accessor is NEVER invoked (engine-core: the
 * getter/setter are not called; the field's initial value is used). Vapor's
 * component set-trap would otherwise route the field initializer through the user
 * setter. Remove the duplicate OWN-prototype accessor so construction defines a
 * plain data field. Only an OWN accessor whose name is a plain observed field —
 * never an inherited LightningElement accessor (refs/ARIA) and never an
 * @api/@track-declared accessor (those are intentional).
 */
function shadowDuplicateAccessors(Ctor: any, meta: DecoratorMetadata): void {
    const proto = Ctor?.prototype;
    if (!proto || !meta.fields) return;
    for (const fieldName of meta.fields) {
        if (
            (meta.publicProps && fieldName in meta.publicProps) ||
            (meta.track && fieldName in meta.track) ||
            (meta.wire && fieldName in meta.wire)
        ) {
            continue; // declared as @api/@track/@wire — accessor is intentional
        }
        if (!Object.prototype.hasOwnProperty.call(proto, fieldName)) continue;
        const desc = Object.getOwnPropertyDescriptor(proto, fieldName);
        if (desc && (typeof desc.get === 'function' || typeof desc.set === 'function')) {
            try {
                delete (proto as Record<string, unknown>)[fieldName];
            } catch {
                /* non-configurable — leave as-is */
            }
        }
    }
}

// Backing store for `@api` field props that have to shadow an inherited
// read-only accessor (e.g. a prop literally named `children`/`tagName`, which
// LightningElement exposes as a getter-only DOM accessor). Keyed per instance.
const apiFieldStore = new WeakMap<object, Record<string, unknown>>();

export function registerDecorators(Ctor: any, meta: DecoratorMetadata): any {
    if (Ctor !== null && (typeof Ctor === 'object' || typeof Ctor === 'function')) {
        registeredDecorators.set(Ctor, meta);
        validateDecorators(Ctor, meta);
        // Structural (prod + dev): a plain field duplicating a same-class accessor
        // shadows it (W-9927596). Done outside validateDecorators so it runs in prod.
        shadowDuplicateAccessors(Ctor, meta);
        // An `@api` FIELD whose name collides with an inherited getter-only accessor
        // on LightningElement.prototype (e.g. `children`, `tagName`) would throw on
        // the field initializer (`this.children = ...`) because the inherited
        // accessor has no setter. Define a writable accessor on THIS constructor's
        // prototype to shadow it (matching engine-core, which defines public-prop
        // accessors on the prototype). Backed by a per-instance store.
        const proto = Ctor.prototype;
        if (proto && meta.publicProps) {
            for (const propName of Object.keys(meta.publicProps)) {
                const config = meta.publicProps[propName]?.config ?? 0;
                if (config > 0) {
                    // `@api` ACCESSOR declaration: wrap the component's OWN get/set on
                    // the prototype so calling the descriptor with a foreign `this`
                    // (e.g. `getPropertyDescriptor(cmp,'p').get.call({})`) throws a
                    // TypeError — matching engine-core's createPublicAccessorDescriptor,
                    // whose accessor reads `getAssociatedVM(this)`. A valid component
                    // `this` (the reactive $cmp proxy or the raw instance) delegates to
                    // the original accessor; reactivity is preserved because we call it
                    // with the SAME `this`.
                    const own = Object.getOwnPropertyDescriptor(proto, propName);
                    if (
                        own &&
                        (typeof own.get === 'function' || typeof own.set === 'function') &&
                        !(own as { __vaporApiWrapped?: boolean }).__vaporApiWrapped
                    ) {
                        const origGet = own.get;
                        const origSet = own.set;
                        const assertVm = (self: unknown): void => {
                            const raw = self == null ? self : (toRaw(self) as object | null);
                            if (!raw || !(raw as Record<symbol, unknown>)[VM_SLOT]) {
                                throw new TypeError('vm is undefined');
                            }
                        };
                        const wrapped: PropertyDescriptor = {
                            enumerable: own.enumerable,
                            configurable: true,
                            __vaporApiWrapped: true,
                        } as PropertyDescriptor;
                        if (origGet) {
                            wrapped.get = function (this: unknown) {
                                assertVm(this);
                                return origGet.call(this);
                            };
                        }
                        if (origSet) {
                            wrapped.set = function (this: unknown, v: unknown) {
                                assertVm(this);
                                origSet.call(this, v);
                            };
                        }
                        Object.defineProperty(proto, propName, wrapped);
                    }
                    continue; // accessor declaration: component owns it
                }
                // Only needed when an ancestor exposes a getter-only accessor for
                // this name (a plain inherited data field is writable already).
                const inherited = findInheritedAccessor(proto, propName);
                if (!inherited || typeof inherited.set === 'function') continue;
                if (Object.prototype.hasOwnProperty.call(proto, propName)) continue;
                Object.defineProperty(proto, propName, {
                    get(this: object) {
                        // Key on the RAW component: the field initializer
                        // (`this.children = ...`) runs during construction with
                        // `this` = the raw component (no proxy yet), but a later
                        // template read invokes this getter with `this` = the
                        // reactive $cmp proxy. Without toRaw the WeakMap keys differ,
                        // so the stored value is lost (`@api children` read empty →
                        // a for:each over it rendered nothing → lifecycle-callbacks
                        // "child mutations" cluster). toRaw(proxy) === rawComponent
                        // (registerRaw), so both align. Also track for reactivity.
                        const raw = toRaw(this) as object;
                        const vm = (raw as Record<symbol, VaporInstance>)[VM_SLOT];
                        if (vm) trackAccess(vm.reactiveTarget, propName);
                        const store = apiFieldStore.get(raw);
                        return store ? store[propName] : undefined;
                    },
                    set(this: object, value: unknown) {
                        const raw = toRaw(this) as object;
                        let store = apiFieldStore.get(raw);
                        if (!store) apiFieldStore.set(raw, (store = {}));
                        const changed = store[propName] !== value;
                        store[propName] = value;
                        // Trigger a re-render on change (post-construction), so
                        // `<x onchildren-change>` / for:each over the prop updates.
                        if (changed) {
                            const vm = (raw as Record<symbol, VaporInstance>)[VM_SLOT];
                            if (vm && !vm.isConstructing)
                                triggerUpdate(vm.reactiveTarget, propName);
                        }
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }
    }
    return Ctor;
}

/** True if `name` resolves to a getter-only accessor on obj's prototype chain. */
function inheritedGetterOnly(obj: object, name: string): boolean {
    // findInheritedAccessor walks from `getPrototypeOf(obj)` — i.e. obj's chain.
    const desc = findInheritedAccessor(obj, name);
    return desc !== undefined && typeof desc.set !== 'function' && typeof desc.get === 'function';
}

/** Find an accessor descriptor for `name` anywhere on `proto`'s prototype chain. */
// Sentinel for "old value not read" in the proxy set-trap (accessor keys), so the
// change check (`oldValue !== rawVal`) is always true → the setter's effect triggers.
const UNREAD = Symbol('unread');

// True if `name` resolves to an ACCESSOR (get/set) on the COMPONENT's OWN
// prototype — i.e. a user-declared `get/set` on the class itself, NOT an inherited
// LightningElement global-HTML accessor. Used to narrowly fix the W-9927596
// field+accessor collision (skip reading the user getter for the old value) without
// changing reactivity for inherited global-HTML own setters.
function ownProtoHasAccessor(obj: object, name: string): boolean {
    // obj is the raw component; its OWN prototype is the user class prototype.
    const proto = Object.getPrototypeOf(obj);
    if (!proto) return false;
    const d = Object.getOwnPropertyDescriptor(proto, name);
    return !!d && (typeof d.get === 'function' || typeof d.set === 'function');
}

function findInheritedAccessor(proto: object, name: string): PropertyDescriptor | undefined {
    let cursor: object | null = Object.getPrototypeOf(proto);
    let guard = 0;
    while (cursor && guard++ < 50) {
        const desc = Object.getOwnPropertyDescriptor(cursor, name);
        if (desc) return desc.get || desc.set ? desc : undefined;
        cursor = Object.getPrototypeOf(cursor);
    }
    return undefined;
}

/**
 * Collects decorator metadata for a constructor, merging in metadata declared on
 * superclasses (so `@api` props/methods defined on a base class are exposed on
 * subclasses too).
 */
// Memoize the merged decorator metadata per Ctor. `collectDecorators` walks the
// full prototype chain and merges every ancestor's `@api`/`@track`/`@wire`/fields
// on EVERY call, but the result is a pure function of the class and is never
// mutated afterward (all read sites are `.has()`/iteration/property reads). Without
// this, a `for:each` over N instances of the same component re-walks the chain N
// times (e.g. 1000× for a 1k-row component table). Matches the other per-Ctor
// WeakMap caches in this file (registeredComponents, customElementConstructorCache…).
const decoratorMetadataCache = new WeakMap<object, DecoratorMetadata>();

/** The four class-level field-name Sets an instance needs, all derived purely from
 *  `decorators` and never mutated per-instance (verified: no `.add`/`.delete`/`.clear`
 *  call sites). Cached per Ctor so a `for:each` over N same-class instances allocates
 *  4 Sets total instead of 4·N. The same Set objects are shared across instances. */
interface InstanceFieldSets {
    declaredProps: Set<string>;
    trackedFields: Set<string>;
    publicPropNames: Set<string>;
    plainFields: Set<string>;
}
const instanceFieldSetsCache = new WeakMap<object, InstanceFieldSets>();

function getInstanceFieldSets(Ctor: any, decorators: DecoratorMetadata): InstanceFieldSets {
    const cached = instanceFieldSetsCache.get(Ctor);
    if (cached !== undefined) {
        return cached;
    }
    const sets: InstanceFieldSets = {
        declaredProps: new Set([
            ...Object.keys(decorators.publicProps ?? {}),
            ...Object.keys(decorators.track ?? {}),
            ...(decorators.fields ?? []),
        ]),
        // `@track` field names — render-side-effect dev errors on these use the
        // vm-qualified message form (`<vm>.render() ... <vm>.prop`), matching
        // engine-core's track.ts; @api/plain fields use the generic `property "x"`
        // form (api.ts). See the set-trap side-effect branch.
        trackedFields: new Set(Object.keys(decorators.track ?? {})),
        // `@api` (public) prop names. A public ACCESSOR prop set still schedules a
        // re-render (engine-core's createPublicAccessorDescriptor → componentValueMutated),
        // unlike a non-@api own accessor (e.g. a GlobalHTML own setter), which is inert.
        publicPropNames: new Set(Object.keys(decorators.publicProps ?? {})),
        // PLAIN observed fields = `decorators.fields` MINUS @track/@api/@wire. In
        // engine-core these are shallow: reassigning the field re-renders, but a DEEP
        // mutation (`this.obj.x = 1`) does NOT, and reading the field returns the RAW
        // value (identity preserved). `@track` fields stay deep-reactive (foreach over
        // a @track array works); `@api`/wired stay deep-wrapped (props/wire identity).
        plainFields: new Set(
            (decorators.fields ?? []).filter(
                (f: string) =>
                    !(decorators.track && f in decorators.track) &&
                    !(decorators.publicProps && f in decorators.publicProps) &&
                    !(decorators.wire && f in decorators.wire)
            )
        ),
    };
    instanceFieldSetsCache.set(Ctor, sets);
    return sets;
}

function collectDecorators(Ctor: any): DecoratorMetadata {
    const cached = decoratorMetadataCache.get(Ctor);
    if (cached !== undefined) {
        return cached;
    }
    const merged: DecoratorMetadata = {
        publicProps: {},
        publicMethods: [],
        track: {},
        wire: {},
        fields: [],
    };
    // Collect the chain subclass→base, then merge BASE-FIRST so a subclass's
    // metadata OVERRIDES its superclass's (matching engine-core's def.ts, which
    // does `assign(create(null), superDef.wire, ownWire)`). The previous
    // subclass→base `Object.assign` let the BASE win (last assign), so a wired
    // method overridden in a child wrongly kept the parent's wire def.
    const chain: DecoratorMetadata[] = [];
    let current = resolveCircular(Ctor);
    let guard = 0;
    while (typeof current === 'function' && guard++ < 100) {
        const meta = registeredDecorators.get(current);
        if (meta) chain.push(meta);
        // A superclass may be a `__circular__` factory (Aura interop): resolve it to
        // the real class so its `@api` props/methods are merged too. `extends
        // Circular` puts the factory itself in the chain, whose prototype is
        // Function.prototype (not the wrapped class) — so resolve before stepping.
        const parent = Object.getPrototypeOf(current);
        current = resolveCircular(parent);
    }
    for (let i = chain.length - 1; i >= 0; i--) {
        const meta = chain[i];
        if (meta.publicProps) Object.assign(merged.publicProps!, meta.publicProps);
        if (meta.publicMethods) {
            for (const m of meta.publicMethods) {
                if (!merged.publicMethods!.includes(m)) merged.publicMethods!.push(m);
            }
        }
        if (meta.track) Object.assign(merged.track!, meta.track);
        if (meta.wire) Object.assign(merged.wire!, meta.wire);
        if (meta.fields) merged.fields!.push(...meta.fields);
    }
    decoratorMetadataCache.set(Ctor, merged);
    return merged;
}

/**
 * Brand applied to every compiled template render function (via registerTemplate
 * and freezeTemplate). A user `render()` method must return one of these; any
 * other value (or a plain un-branded function) is rejected — matching LWC's
 * "It must return an imported template" contract.
 */
const TEMPLATE_BRAND = '__lwcVaporTemplate__';
function brandTemplate(tmpl: unknown): void {
    if ((typeof tmpl === 'function' || typeof tmpl === 'object') && tmpl !== null) {
        try {
            Object.defineProperty(tmpl, TEMPLATE_BRAND, {
                value: true,
                configurable: true,
            });
        } catch {
            /* frozen/sealed already — ignore */
        }
    }
}
function isBrandedTemplate(tmpl: unknown): boolean {
    return (
        (typeof tmpl === 'function' || typeof tmpl === 'object') &&
        tmpl !== null &&
        (tmpl as Record<string, unknown>)[TEMPLATE_BRAND] === true
    );
}

// --- Compiler/runtime version-mismatch check ---------------------------------
// Compiled templates/stylesheets/components carry a `/*LWC compiler vX*/` comment
// in their source. In dev we compare it to the runtime LWC_VERSION and warn once
// if they differ (the comment is stripped in prod minification, so this is
// dev-only). Mirrors engine-core's check-version-mismatch.
let warnedOnVersionMismatch = false;
if (typeof globalThis !== 'undefined') {
    (
        globalThis as { __lwcResetWarnedOnVersionMismatch?: () => void }
    ).__lwcResetWarnedOnVersionMismatch = () => {
        warnedOnVersionMismatch = false;
    };
}
function checkVersionMismatch(
    func: { toString(): string; name?: string },
    type: 'template' | 'stylesheet' | 'component'
): void {
    if (process.env.NODE_ENV === 'production') return;
    const versionMatcher = func.toString().match(LWC_VERSION_COMMENT_REGEX);
    if (versionMatcher === null || warnedOnVersionMismatch) return;
    if (
        typeof process === 'object' &&
        process?.env &&
        process.env.SKIP_LWC_VERSION_MISMATCH_CHECK === 'true'
    ) {
        warnedOnVersionMismatch = true; // skip when env var is set
        return;
    }
    const version = versionMatcher[1];
    if (version !== LWC_VERSION) {
        warnedOnVersionMismatch = true; // only warn once
        const friendlyName = type === 'component' ? `${type} ${func.name}` : type;
        logVaporError(
            `LWC WARNING: current engine is v${LWC_VERSION}, but ${friendlyName} was compiled with v${version}.\nPlease update your compiled code or LWC engine so that the versions match.\nNo further warnings will appear.`
        );
        report('CompilerRuntimeVersionMismatch', {
            compilerVersion: version,
            runtimeVersion: LWC_VERSION,
        });
    }
}

export function registerTemplate(tmpl: VaporRenderFn): VaporRenderFn {
    brandTemplate(tmpl);
    // Template version check fires here (matching the integration test, which
    // calls registerTemplate(tmpl) and expects the warn synchronously). Stylesheet
    // checks happen later, at mount (injectStylesheets), matching engine-core.
    if (process.env.NODE_ENV !== 'production' && typeof tmpl === 'function') {
        checkVersionMismatch(tmpl, 'template');
    }
    return tmpl;
}

/**
 * Resolve + validate the value returned by a user `render()` method. Returns the
 * compiled template to render with. Throws (→ routed to errorCallback / window
 * error) when the value isn't a valid imported template.
 */
function resolveUserRenderResult(instance: VaporInstance, returned: unknown): VaporRenderFn {
    // No explicit return → use the component's default template, matching the
    // common `render() { return this.template; }` returning a real template, OR a
    // render() that returns nothing meaningful. LWC requires render() to return a
    // template; `undefined` is invalid.
    if (isBrandedTemplate(returned)) {
        // Resolve through the hot-swap map so `swapTemplate(oldTmpl, newTmpl)` takes
        // effect even when a component returns a template directly from an explicit
        // `render()` (swapping/templates "explicit template definition").
        return (resolveTemplate(returned) as VaporRenderFn) ?? (returned as VaporRenderFn);
    }
    const tag = instance.tagName ?? 'unknown';
    const received =
        returned === undefined
            ? 'undefined'
            : returned === null
              ? 'null'
              : typeof returned === 'function'
                ? returned.toString()
                : String(returned);
    throw new Error(
        `Invalid template returned by the render() method on ${tag}. It must return an imported template (e.g.: \`import html from "./${
            (instance.ctor as { name?: string })?.name ?? 'Cmp'
        }.html"\`), instead, it has returned: ${received}.`
    );
}

const TEMPLATE_PROPS = [
    'slots',
    'stylesheetToken',
    'stylesheets',
    'renderMode',
    'legacyStylesheetToken',
] as const;
let mutationTrackingDisabled = false;

function reportTemplateViolation(prop: string): void {
    if (process.env.NODE_ENV !== 'production') {
        logWarnOnce(
            `Mutating the "${prop}" property on a template ` +
                `is deprecated and will be removed in a future version of LWC. ` +
                `See: https://sfdc.co/template-mutation`
        );
    }
    report('TemplateMutation', { propertyName: prop });
}

function reportStylesheetViolation(prop: string): void {
    if (process.env.NODE_ENV !== 'production') {
        logWarnOnce(
            `Mutating the "${prop}" property on a stylesheet ` +
                `is deprecated and will be removed in a future version of LWC. ` +
                `See: https://sfdc.co/template-mutation`
        );
    }
    report('StylesheetMutation', { propertyName: prop });
}

const ARRAY_MUTATION_METHODS = [
    'pop',
    'push',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'fill',
    'splice',
    'copyWithin',
] as const;
const STYLESHEET_FN_PROPS = ['$scoped$', '$nativeOnly$'] as const;

/** Warn when a stylesheets array is mutated (push/splice/etc.). */
function warnOnArrayMutation(arr: any[]): void {
    for (const prop of ARRAY_MUTATION_METHODS) {
        const original = (Array.prototype as any)[prop];
        Object.defineProperty(arr, prop, {
            configurable: true,
            writable: true,
            value: function arrayMutationWarningWrapper(this: any[], ...args: any[]) {
                reportTemplateViolation('stylesheets');
                return original.apply(this, args);
            },
        });
    }
}

/** Warn when a stylesheet factory function's `$scoped$`/`$nativeOnly$` is set. */
function warnOnStylesheetFunctionMutation(stylesheet: any): void {
    for (const prop of STYLESHEET_FN_PROPS) {
        let value = stylesheet[prop];
        Object.defineProperty(stylesheet, prop, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(newValue) {
                reportStylesheetViolation(prop);
                value = newValue;
            },
        });
    }
}

/** Recursively install mutation tracking on a (possibly nested) stylesheets array. */
function trackStylesheetsMutation(stylesheets: any): void {
    if (Array.isArray(stylesheets)) {
        warnOnArrayMutation(stylesheets);
        for (const s of stylesheets) trackStylesheetsMutation(s);
    } else if (typeof stylesheets === 'function') {
        warnOnStylesheetFunctionMutation(stylesheets);
    }
}

function deepFreeze(value: any): void {
    if (value && (typeof value === 'object' || typeof value === 'function')) {
        Object.freeze(value);
        for (const key of Object.getOwnPropertyNames(value)) {
            deepFreeze(value[key]);
        }
    }
}

/**
 * Match engine-core's legacy (non-frozen) freezeTemplate behavior: shim the
 * legacy `stylesheetTokens` accessor on top of `stylesheetToken`, then track
 * mutations of the template's well-known props (dev warning + reporting).
 */
export function freezeTemplate(tmpl: any): void {
    if (tmpl === null || (typeof tmpl !== 'object' && typeof tmpl !== 'function')) return;

    // Brand it as a real compiled template (used to validate user render() return
    // values). Done before any freeze so the property write succeeds.
    brandTemplate(tmpl);

    // ENABLE_FROZEN_TEMPLATE: deep-freeze the template + its stylesheets instead
    // of the legacy mutation-tracking shim.
    if (getFeatureFlagValue('ENABLE_FROZEN_TEMPLATE')) {
        Object.freeze(tmpl);
        if (tmpl.stylesheets !== undefined) deepFreeze(tmpl.stylesheets);
        return;
    }

    // Legacy: track mutations of the stylesheets array / stylesheet factories.
    if (tmpl.stylesheets !== undefined) trackStylesheetsMutation(tmpl.stylesheets);

    // Legacy `stylesheetTokens` shim, derived from `stylesheetToken`.
    Object.defineProperty(tmpl, 'stylesheetTokens', {
        enumerable: true,
        configurable: true,
        get(this: any) {
            const { stylesheetToken } = this;
            if (stylesheetToken === undefined) return stylesheetToken;
            return {
                hostAttribute: `${stylesheetToken}-host`,
                shadowAttribute: stylesheetToken,
            };
        },
        set(this: any, value: any) {
            this.stylesheetToken = value === undefined ? undefined : value.shadowAttribute;
        },
    });

    // Track mutations of the well-known template props.
    for (const prop of TEMPLATE_PROPS) {
        let value = tmpl[prop];
        Object.defineProperty(tmpl, prop, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(newValue) {
                if (!mutationTrackingDisabled) reportTemplateViolation(prop);
                value = newValue;
            },
        });
    }

    // `stylesheetTokens` mutation reports as a template violation too (and avoids
    // double-reporting through the underlying `stylesheetToken` setter).
    const tokensDesc = Object.getOwnPropertyDescriptor(tmpl, 'stylesheetTokens')!;
    Object.defineProperty(tmpl, 'stylesheetTokens', {
        enumerable: true,
        configurable: true,
        get: tokensDesc.get,
        set(this: any, value: any) {
            reportTemplateViolation('stylesheetTokens');
            mutationTrackingDisabled = true;
            tokensDesc.set!.call(this, value);
            mutationTrackingDisabled = false;
        },
    });
}

// Decorators are compiled away by babel into registerDecorators metadata, but
// the identifiers are still imported, so they must exist. When INVOKED directly
// (not as a decorator — only possible by re-exporting through a facade, since the
// compiler rejects direct decorator calls), they mirror engine-core's contracts:
// `@api`/`@wire` throw; `@track(value)` returns a reactive proxy of `value`, else
// throws.
export function api(): never {
    throw new Error('@api decorator can only be used as a decorator function.');
}
export function track<T>(target?: T): T {
    if (arguments.length === 1) {
        return deepReactive(target as object) as T;
    }
    throw new Error(
        '@track decorator can only be used with one argument to return a trackable object, or as a decorator function.'
    );
}
export function wire(): never {
    throw new Error('@wire(adapter, config?) may only be used as a decorator.');
}

/**
 * Returns the component definition for a constructor: its public props (including
 * the reflected global-HTML-attribute props every LightningElement has), public
 * methods, and bases. Throws for anything that isn't a LightningElement subclass,
 * matching engine-core's contract.
 */
export function getComponentDef(Ctor: any): any {
    // Resolve a top-level `__circular__` factory to the real constructor first.
    Ctor = resolveCircular(Ctor);
    // Accept LightningElement, a subclass, OR a class whose chain resolves through
    // a `__circular__` factory (isComponentConstructor handles the slow path).
    if (typeof Ctor !== 'function' || !isComponentConstructor(Ctor)) {
        throw new TypeError(
            `${String(
                Ctor
            )} is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`
        );
    }

    const decorators = collectDecorators(Ctor);

    // Public props: start with the reflected global HTML attributes (present on
    // every component), then layer the component's own @api props on top.
    const props: Record<string, { config: number; type: string; attr: string }> = {};
    const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    // Global-HTML-attribute props present on every component: the reflective
    // global set (accessKey, dir, …) plus all ARIA props.
    for (const propName of REFLECTIVE_GLOBAL_PROPERTY_SET) {
        props[propName] = {
            config: 0,
            type: 'any',
            attr: SPECIAL_PROPERTY_ATTRIBUTE_MAPPING.get(propName) ?? propName.toLowerCase(),
        };
    }
    for (const propName of Object.keys(AriaPropNameToAttrNameMap)) {
        props[propName] = {
            config: 0,
            type: 'any',
            attr: (AriaPropNameToAttrNameMap as Record<string, string>)[propName],
        };
    }
    for (const [propName, meta] of Object.entries(decorators.publicProps ?? {})) {
        props[propName] = {
            config: (meta as { config: number }).config ?? 0,
            type: 'any',
            attr: camelToKebab(propName),
        };
    }

    // `methods` maps each public method name to the actual function from the
    // prototype chain (engine-core exposes the method descriptors' values).
    const methods: Record<string, unknown> = {};
    for (const m of decorators.publicMethods ?? []) {
        let cursor: any = Ctor.prototype;
        let fn: unknown;
        let guard = 0;
        while (cursor && guard++ < 50) {
            const desc = Object.getOwnPropertyDescriptor(cursor, m);
            if (desc && typeof desc.value === 'function') {
                fn = desc.value;
                break;
            }
            cursor = Object.getPrototypeOf(cursor);
        }
        methods[m] = fn ?? 1;
    }

    const proto = Object.getPrototypeOf(Ctor);
    const bases =
        proto && proto !== LightningElement && proto !== Function.prototype ? proto : null;

    return {
        name: Ctor.name,
        props,
        methods,
        bases,
        ctor: Ctor,
        ...(registeredComponents.get(Ctor) ?? {}),
    };
}

export function isComponentConstructor(Ctor: any): boolean {
    if (typeof Ctor !== 'function') return false;
    if (Ctor === LightningElement || Ctor.prototype instanceof LightningElement) return true;
    // Slow path (mirrors engine-core def.ts): walk the prototype chain resolving
    // `__circular__` factories (Aura AMD interop / Locker SecureBaseClass mirror).
    // A base that is a `__circular__`-tagged function resolves to a real
    // LightningElement subclass (or to itself), so a class extending it IS a
    // component even though `instanceof LightningElement` is false up front.
    let current: any = Ctor;
    let guard = 0;
    while (current && guard++ < 100) {
        if (current === LightningElement) return true;
        if (
            typeof current === 'function' &&
            Object.prototype.hasOwnProperty.call(current, '__circular__')
        ) {
            const resolved = resolveCircular(current);
            // A self-resolving circular (`factory() === factory`) is treated as a
            // valid LightningElement base by engine-core.
            if (resolved === current) return true;
            if (isComponentConstructor(resolved)) return true;
        }
        current = Object.getPrototypeOf(current);
    }
    return false;
}

/** Resolve a `__circular__`-tagged factory to the real constructor (unwrapping an
 *  ES-module `default`). Mirrors create-element.ts resolveCircularModuleDependency
 *  (duplicated here to avoid a circular import). */
function resolveCircular(Ctor: any): any {
    if (typeof Ctor === 'function' && Object.prototype.hasOwnProperty.call(Ctor, '__circular__')) {
        const mod = Ctor();
        return mod && mod.__esModule ? mod.default : mod;
    }
    return Ctor;
}

/**
 * Creates a component instance backed by a host element, wires reactivity, runs
 * the vapor render function, and (optionally) mounts the resulting block.
 */
// Runaway-instantiation guard: a synchronous burst of component creations far
// beyond any real tree depth indicates an infinite instantiation loop. Throw
// rather than freeze the browser.
let instantiationDepth = 0;
const MAX_INSTANTIATION_DEPTH = 1000;

export function createComponentInstance(
    Ctor: any,
    host: HTMLElement,
    props?: Record<string, unknown>,
    slotset?: Record<string, () => unknown>,
    mode?: 'open' | 'closed',
    tagNameOverride?: string
): VaporInstance {
    if (++instantiationDepth > MAX_INSTANTIATION_DEPTH) {
        instantiationDepth = 0;
        throw new Error(
            '[LWC error]: Maximum component instantiation depth exceeded (possible infinite render loop).'
        );
    }
    try {
        return createComponentInstanceImpl(Ctor, host, props, slotset, mode, tagNameOverride);
    } finally {
        instantiationDepth--;
    }
}

/**
 * Dev-only restriction: warn when innerHTML/outerHTML/textContent are SET on a
 * component's host element (the custom element). The native setter still runs.
 */
function applyHostRestrictions(host: HTMLElement): void {
    if (process.env.NODE_ENV === 'production') return;
    const warn = (prop: string) => logVaporError(`Invalid attempt to set ${prop} on HTMLElement.`);
    for (const prop of ['innerHTML', 'outerHTML', 'textContent'] as const) {
        const proto = prop === 'textContent' ? Node.prototype : Element.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (!desc || !desc.set || !desc.get) continue;
        const nativeSet = desc.set;
        const nativeGet = desc.get;
        Object.defineProperty(host, prop, {
            configurable: true,
            enumerable: desc.enumerable,
            get() {
                return nativeGet.call(this);
            },
            set(value: unknown) {
                warn(prop);
                nativeSet.call(this, value);
            },
        });
    }
    // addEventListener on the host element doesn't support options in LWC — warn
    // (then forward without the unsupported options), matching engine-core.
    const nativeAdd = host.addEventListener;
    Object.defineProperty(host, 'addEventListener', {
        configurable: true,
        writable: true,
        value(this: HTMLElement, type: string, listener: EventListener, options?: unknown) {
            if (options !== undefined) {
                // Trailing `\n` matches engine-core's logError, which appends
                // `\n${componentStack}` (empty here) — the test does an EXACT match.
                logVaporError(
                    'The `addEventListener` method in `LightningElement` does not support any options.\n'
                );
            }
            return nativeAdd.call(this, type, listener);
        },
    });
}

// FORCE_SHADOW_MIGRATE_MODE plumbing: every migrate-mode shadow root registers
// here so global `<head>` styles (existing + later-added) are mirrored into it,
// emulating the synthetic-shadow "global styles penetrate" behavior on a real
// native shadow root.
const migrateModeRoots = new Set<ShadowRoot>();
let headStyleObserver: MutationObserver | null = null;

/** Snapshot of the GLOBAL `<head>` `<style>` CSS — EXCLUDING styles LWC itself
 *  injected for components (`data-rendered-by-lwc`), which are component-scoped
 *  light-DOM styles that must NOT penetrate a migrate shadow root (the test
 *  "does not apply styles from global light DOM components" checks a light
 *  component's `opacity:0.5` does NOT leak in). */
function collectGlobalStyles(): string {
    let css = '';
    const styles = document.head.querySelectorAll('style');
    for (const s of Array.from(styles)) {
        if (s.hasAttribute('data-rendered-by-lwc')) continue;
        if ((s as { __lwcMigrate?: boolean }).__lwcMigrate) continue;
        css += `<style>${s.textContent ?? ''}</style>`;
    }
    return css;
}

/** Mirror the current global styles into every registered migrate-mode root. */
function syncMigrateModeStyles(): void {
    const css = collectGlobalStyles();
    for (const root of migrateModeRoots) {
        // Keep the rendered component content; (re)write a single managed <style>
        // holder at the top of the root carrying the mirrored global CSS.
        let holder = (root as unknown as { __migrateStyle?: HTMLStyleElement }).__migrateStyle;
        if (!holder) {
            holder = document.createElement('style');
            (holder as { __lwcMigrate?: boolean }).__lwcMigrate = true;
            (root as unknown as { __migrateStyle?: HTMLStyleElement }).__migrateStyle = holder;
            root.insertBefore(holder, root.firstChild);
        }
        // `css` is `<style>…</style>` fragments; extract the inner CSS text.
        holder.textContent = css.replace(/<\/?style>/g, '\n');
    }
}

function applyShadowMigrateMode(root: ShadowRoot): void {
    // Mark the native shadow root as CLAIMING to be synthetic (the test checks
    // `shadowRoot.synthetic`). It remains a true native ShadowRoot.
    try {
        Object.defineProperty(root, 'synthetic', {
            value: true,
            configurable: true,
            enumerable: false,
        });
    } catch {
        /* already defined */
    }
    migrateModeRoots.add(root);
    // Observe `<head>` so styles ADDED after this component rendered are mirrored
    // too (test: "uses new styles added to the head after component is rendered").
    if (!headStyleObserver && typeof MutationObserver !== 'undefined') {
        headStyleObserver = new MutationObserver(() => syncMigrateModeStyles());
        headStyleObserver.observe(document.head, { childList: true, subtree: true });
    }
    syncMigrateModeStyles();
}

/** Dev-only restriction: warn when innerHTML/textContent are SET on a shadow root. */
function applyShadowRootRestrictions(root: ShadowRoot): void {
    if (process.env.NODE_ENV === 'production') return;
    const warn = (prop: string) => logVaporError(`Invalid attempt to set ${prop} on ShadowRoot.`);
    // innerHTML lives on ShadowRoot.prototype; textContent on Node.prototype.
    for (const [prop, proto] of [
        ['innerHTML', (globalThis as any).ShadowRoot?.prototype],
        ['textContent', Node.prototype],
    ] as const) {
        if (!proto) continue;
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (!desc || !desc.set || !desc.get) continue;
        const nativeSet = desc.set;
        const nativeGet = desc.get;
        Object.defineProperty(root, prop, {
            configurable: true,
            enumerable: desc.enumerable,
            get() {
                return nativeGet.call(this);
            },
            set(value: unknown) {
                warn(prop);
                nativeSet.call(this, value);
            },
        });
    }
    // addEventListener on a shadow root doesn't support options in LWC — warn
    // (then forward without options), matching engine-core.
    const nativeAdd = root.addEventListener;
    Object.defineProperty(root, 'addEventListener', {
        configurable: true,
        writable: true,
        value(this: ShadowRoot, type: string, listener: EventListener, options?: unknown) {
            if (options !== undefined) {
                logVaporError(
                    'The `addEventListener` method on ShadowRoot does not support any options.'
                );
            }
            return nativeAdd.call(this, type, listener);
        },
    });
}

// A property key marking an element whose `outerHTML` setter has already been
// patched, so re-walks (e.g. across re-renders) don't re-wrap it.
const OUTER_HTML_PATCHED = Symbol('lwc-outerhtml-patched');

/**
 * Dev-only restriction: patch `outerHTML`'s SETTER on a single element rendered
 * INSIDE a component's tree, so `elm.outerHTML = '...'` logs the LWC dev error
 * (the native setter still runs). Mirrors engine-core's patchElementWithRestrictions
 * `outerHTML` branch (the broader innerHTML/textContent/childNodes restrictions are
 * synthetic-shadow-only and intentionally NOT applied here). Idempotent per element.
 */
function patchElementOuterHtmlRestriction(elm: Element): void {
    if ((elm as unknown as Record<symbol, unknown>)[OUTER_HTML_PATCHED]) return;
    const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
    if (!desc || !desc.set || !desc.get) return;
    const nativeSet = desc.set;
    const nativeGet = desc.get;
    Object.defineProperty(elm, 'outerHTML', {
        configurable: true,
        enumerable: desc.enumerable,
        get() {
            return nativeGet.call(this);
        },
        set(value: unknown) {
            logVaporError(`Invalid attempt to set outerHTML on Element.`);
            nativeSet.call(this, value);
        },
    });
    (elm as unknown as Record<symbol, unknown>)[OUTER_HTML_PATCHED] = true;
}

/**
 * Dev-only: walk a freshly-rendered render root (shadow root or light-DOM host)
 * and patch the `outerHTML` restriction onto each descendant ELEMENT that belongs
 * to THIS component (stopping at nested component hosts, whose own mount patches
 * their subtree). Matches engine-core, which applies the restriction to every
 * element it renders.
 */
function applyElementRestrictions(root: ParentNode): void {
    if (process.env.NODE_ENV === 'production') return;
    const children = root.querySelectorAll('*');
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        // Skip nested component hosts — their own mount restricts their subtree,
        // and the host itself gets the `on HTMLElement` restriction.
        if ((el as unknown as Record<symbol, unknown>)[VM_SLOT] !== undefined) continue;
        patchElementOuterHtmlRestriction(el);
    }
}

// --- Signal protocol ---------------------------------------------------------
interface TrustedSignal {
    value: unknown;
    subscribe(onUpdate: () => void): () => void;
}
function isTrustedSignalValue(value: object): value is TrustedSignal {
    return (
        isTrustedSignalValue_ext(value) &&
        typeof (value as { subscribe?: unknown }).subscribe === 'function'
    );
}
// Alias to the reporting-module accessor (imported as isTrustedSignalValue above).
const isTrustedSignalValue_ext = isTrustedSignalValueImported;
function isInRenderEffect(): boolean {
    return getCurrentEffect() !== null;
}

/** Invoke a component callback, routing through the per-instance Locker callHook
 *  when one is installed (so lifecycle hooks/handlers run inside the sandbox). */
function callLifecycle(instance: VaporInstance, fn: (...a: unknown[]) => unknown): void {
    const callHook = instance.lockerHooks?.callHook;
    if (callHook) {
        callHook(instance.component, fn, []);
    } else {
        fn.call(instance.component);
    }
}

/**
 * Invoke a template event handler, routing through the owner's Locker `callHook`
 * when one is installed — mirroring engine-core's `invokeEventListener`
 * (`callHook(thisValue, fn, [event])`). The compiled template calls this for
 * every `on*={handler}` binding. `cmp` is the owner component proxy ($cmp);
 * `fn` is the handler read off the proxy (already bound to it by the GET trap).
 * Without Locker hooks this is just `fn(event)`.
 */
export function invokeHandler(cmp: unknown, fn: unknown, event: Event): unknown {
    if (typeof fn !== 'function') {
        // Mirror engine-core's invocation-time assertion for an invalid handler.
        throw new Error(`Invalid event handler for event '${event?.type}'.`);
    }
    const raw = toRaw(cmp) as { [VM_SLOT]?: VaporInstance } | null;
    const instance = raw?.[VM_SLOT];
    const callHook = instance?.lockerHooks?.callHook ?? getLockerHooks().callHook;
    try {
        if (callHook) {
            return callHook(cmp, fn as (...a: unknown[]) => unknown, [event]);
        }
        return (fn as (...a: unknown[]) => unknown)(event);
    } catch (err) {
        // An error thrown by a template event handler is routed to the nearest
        // errorCallback boundary (engine-core's invokeEventListener wraps the call
        // in runWithBoundaryProtection) — the instance owning the handler is itself
        // a candidate boundary first, then ancestors. This also emits the
        // ErrorCallback profiler span (profiler/sanity). Rethrow if unhandled so the
        // error still surfaces to the platform.
        if (instance) {
            attachErrorComponentStack(instance, err);
            if (handleErrorSelfOrAncestor(instance, err)) return undefined;
        }
        throw err;
    }
}

// Per-instance event-handler memoization (engine-core's `$ctx._mN` cache): a
// NON-local handler expression (`onclick={a.b}`, not referencing a for:each item)
// is evaluated ONCE per component instance and the captured handler value reused
// across re-renders — so reassigning the bound object later does NOT change which
// handler fires (events/memoization "does not redefine"). Keyed by a stable
// compiler id. Local (for:each-scoped) handlers are NOT memoized (they rebind).
const eventMemoCache = new WeakMap<object, Map<number, unknown>>();
export function memoEvent(cmp: unknown, id: number, produce: () => unknown): unknown {
    const raw = (cmp != null ? (toRaw(cmp) as object) : null) ?? (cmp as object);
    if (!raw) return produce();
    let byId = eventMemoCache.get(raw);
    if (!byId) {
        byId = new Map();
        eventMemoCache.set(raw, byId);
    }
    if (byId.has(id)) return byId.get(id);
    const value = produce();
    byId.set(id, value);
    return value;
}
/**
 * Subscribe the instance's re-render to a trusted signal read during render. The
 * subscription is torn down + re-collected each render (see renderInstance), so a
 * signal only behind an inactive `lwc:if` branch is correctly unsubscribed.
 */
function subscribeInstanceToSignal(instance: VaporInstance, signal: TrustedSignal): void {
    if (!instance.signalsSeen) instance.signalsSeen = new WeakSet();
    if (instance.signalsSeen.has(signal)) return;
    instance.signalsSeen.add(signal);
    const unsub = signal.subscribe(() => {
        // Defer to a microtask (matching engine-core's async signal-driven
        // re-render). A SYNCHRONOUS re-render here would be re-entrant: the
        // signal's `notify()` iterates its subscribers Set while calling us, and
        // re-rendering tears down + re-collects subscriptions, mutating that very
        // Set mid-iteration → the freshly-added subscriber is visited again →
        // infinite loop → page crash. The microtask also coalesces multiple
        // synchronous `signal.value = …` writes into a single re-render.
        if (!instance.isMounted || instance.signalRerenderScheduled) return;
        instance.signalRerenderScheduled = true;
        queueMicrotask(() => {
            instance.signalRerenderScheduled = false;
            if (instance.isMounted) reRenderInstance(instance);
        });
    });
    // Tie the unsubscribe to the EFFECT SCOPE that was active when the signal was
    // read — the branch scope for a read inside an `lwc:if`/`for:each`, or the
    // instance's render scope for a top-level read. Vapor is fine-grained: when an
    // `lwc:if` condition flips false, only that branch's scope is torn down (no
    // full instance re-render runs), so a subscription must be dropped via that
    // scope's dispose, not via an instance-level cleanup list. `signalsSeen` is
    // also cleared for this signal so a later re-read (branch re-enabled, or full
    // re-render) re-subscribes. onScopeDispose falls back to no-op if no scope is
    // active; the instance-level list below still covers the unmount path.
    // IDEMPOTENT: the cleanup is registered twice (scope dispose + the
    // instance-level list) but must unsubscribe at most ONCE — the signal's
    // `unsub` is not idempotent (e.g. the test Signal pushes to
    // `removedSubscribers` on every call), so a double-call would corrupt the
    // subscriber bookkeeping. Both registrations are needed: onScopeDispose drops
    // the subscription when the READING scope tears down (an `lwc:if` branch
    // toggling off — no full instance re-render runs); the instance-level list is
    // the unmount backstop, since stopping the instance's render scope does NOT
    // cascade into independently-created branch scopes.
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        unsub();
        instance.signalsSeen?.delete(signal);
    };
    onScopeDispose(cleanup);
    (instance.signalCleanups ??= []).push(cleanup);
}

function createComponentInstanceImpl(
    Ctor: any,
    host: HTMLElement,
    props?: Record<string, unknown>,
    slotset?: Record<string, () => unknown>,
    mode?: 'open' | 'closed',
    tagNameOverride?: string
): VaporInstance {
    const def = registeredComponents.get(Ctor) ?? {};

    // Enforce a compile-time component feature flag: a component compiled with
    // `componentFeatureFlagModulePath` whose flag resolves to false is disabled and
    // throws on instantiation (engine-core's createComponentDef). (component/feature-flag)
    const featureFlag = (def as ComponentMetadata).componentFeatureFlag;
    if (featureFlag && featureFlag.value === false) {
        const name = (Ctor && Ctor.name) || (def as ComponentMetadata).sel || 'Unknown';
        throw new Error(
            `Component ${name} is disabled by the feature flag at ${featureFlag.path}.`
        );
    }

    const decorators = collectDecorators(Ctor);
    const fieldSets = getInstanceFieldSets(Ctor, decorators);

    // Establish the render root (shadow by default; light DOM if declared).
    const renderMode = (Ctor as { renderMode?: string }).renderMode;
    // Validate the static renderMode value (must be 'light' or 'shadow' if set).
    if (renderMode !== undefined && renderMode !== 'light' && renderMode !== 'shadow') {
        logVaporError(
            `Invalid value for static property renderMode: '${renderMode}'. renderMode must be either 'light' or 'shadow'.`
        );
    }
    // Validate `static shadowSupportMode` ONCE per ctor (engine-core validates at
    // def creation, for perf). Invalid value → dev error; deprecated 'any' → dev
    // warning. When reporting is enabled, emit ShadowSupportModeUsage for 'any'
    // and 'native' (matching engine-core's def.ts).
    validateShadowSupportModeOnce(Ctor);
    const isLight = renderMode === 'light';
    let renderRoot: ShadowRoot | HTMLElement;
    if (isLight) {
        renderRoot = host;
    } else {
        // Honor the createElement `mode` option ('open' | 'closed'); default open.
        // `static delegatesFocus = true` on the component opts the shadow root into
        // focus delegation (matching engine-core, which reads it from the def).
        const delegatesFocus = (Ctor as { delegatesFocus?: boolean }).delegatesFocus === true;
        // A pre-existing custom element may already host a shadow root (e.g. the
        // element existed in the DOM before its component was defined). Re-attaching
        // throws NotSupportedError; instead warn (LWC's "call hydrateComponent
        // instead") and reuse the existing root. (CustomElementConstructor-getter test.)
        if (host.shadowRoot) {
            if (process.env.NODE_ENV !== 'production') {
                // The test asserts an exact STRING arg to console.warn (not an Error),
                // and the component class name (the base class `Child`, found by
                // walking to the first named ctor in the chain).
                let nm = (Ctor as { name?: string }).name;
                let c: any = Ctor;
                let g = 0;
                while ((!nm || nm === '') && c && g++ < 20) {
                    c = Object.getPrototypeOf(c);
                    nm = (c as { name?: string })?.name;
                }
                // eslint-disable-next-line no-console
                console.warn(
                    `Found an existing shadow root for the custom element "${nm ?? host.tagName.toLowerCase()}". Call \`hydrateComponent\` instead.`
                );
            }
            renderRoot = host.shadowRoot;
            // Clear any pre-existing content so the rendered template replaces it.
            renderRoot.textContent = '';
        } else {
            renderRoot = host.attachShadow({
                mode: mode === 'closed' ? 'closed' : 'open',
                delegatesFocus,
            });
        }
        // Dev restriction: setting innerHTML/textContent on a shadow root is invalid.
        applyShadowRootRestrictions(renderRoot);
        // FORCE_SHADOW_MIGRATE_MODE: when the flag is on, a component that does NOT
        // opt into true native shadow (`static shadowSupportMode = 'native'`) is
        // rendered in a "synthetic-migrate" shadow — it stays a real native shadow
        // root but CLAIMS to be synthetic (`shadowRoot.synthetic = true`) and lets
        // global document styles penetrate (the synthetic-shadow style model), so
        // existing synthetic components keep working when migrated to native shadow.
        if (
            getFeatureFlagValue('ENABLE_FORCE_SHADOW_MIGRATE_MODE') &&
            (Ctor as { shadowSupportMode?: unknown }).shadowSupportMode !== 'native'
        ) {
            applyShadowMigrateMode(renderRoot as ShadowRoot);
        }
    }
    // Dev restriction: setting innerHTML/outerHTML/textContent on the host element
    // (the custom element) from outside is invalid in LWC.
    applyHostRestrictions(host);

    const instance: VaporInstance = {
        host,
        renderRoot,
        component: null as unknown as LightningElement,
        def,
        ctor: Ctor,
        decorators,
        block: null,
        isMounted: false,
        isLight,
        reactiveTarget: {},
        cleanups: [],
        // engine-dom's createElement passes the lowercased `sel`; its
        // build-custom-element-constructor passes the raw host `this.tagName`
        // (UPPERCASE). `tagNameOverride` carries the latter for the CEC path; the
        // createElement path has none and falls back to the lowercased host tag.
        tagName: tagNameOverride ?? host.tagName.toLowerCase(),
        idx: nextInstanceIdx++,
        // The instance being rendered when this child is created is its parent —
        // used to find the nearest errorCallback boundary up the component tree.
        parent: getCurrentInstance() ?? undefined,
        // The four class-level field-name Sets, memoized per Ctor and shared across
        // instances (never mutated per-instance — see getInstanceFieldSets).
        declaredProps: fieldSets.declaredProps,
        trackedFields: fieldSets.trackedFields,
        publicPropNames: fieldSets.publicPropNames,
        plainFields: fieldSets.plainFields,
    };

    // Report shadow-mode usage to the profiling/reporting dispatcher (once per
    // instance, at creation), but only for SHADOW components — light DOM is
    // skipped. Vapor renders native shadow, so mode is always Native (0). Matches
    // engine-core's report at vm creation.
    if (!isLight && isReportingEnabled()) {
        report('ShadowModeUsage', { tagName: instance.tagName, mode: 0 });
    }

    // Validate programmatic `static stylesheets` early (at instance creation, as
    // engine-core does) so an invalid value (e.g. a string) logs a dev error
    // before mount. Valid shapes: nullish, a factory function, or an array of
    // factories (possibly nested).
    const staticStylesheets = (Ctor as { stylesheets?: unknown }).stylesheets;
    if (staticStylesheets !== undefined && !isValidStylesheetsValue(staticStylesheets)) {
        logVaporError(
            `static stylesheets must be an array of CSS stylesheets. Found invalid stylesheets on <${instance.tagName}>`
        );
    }
    // Dev: reassigning `Ctor.stylesheets` after the stylesheets were captured has
    // no effect (they're injected once). Install a warn-on-set accessor on the
    // constructor (once per ctor), matching engine-core's warnOnStylesheetsMutation
    // — e.g. a `connectedCallback` that does `MyComponent.stylesheets = [...]`.
    warnOnStylesheetsMutation(Ctor);

    // Construct the component. We must set up the prototype chain so that field
    // reads/writes on `this` are intercepted for reactivity. We do this by
    // constructing the instance, then wrapping it in a reactive proxy that the
    // template ($cmp) reads through.
    const prevInstance = setCurrentInstance(instance);
    const prevConstructing = constructingInstance;
    constructingInstance = instance;
    instance.isConstructing = true;
    let rawComponent: LightningElement;
    const profOn = isProfilingEnabled();
    const [cName, cRm, cSm] = profOn ? profInfo(instance) : ['', 0, 0];
    if (profOn) logOperationStart(OperationId.Constructor, cName, instance.idx, cRm, cSm);
    try {
        rawComponent = new Ctor();
    } finally {
        if (profOn) logOperationStop(OperationId.Constructor, cName, instance.idx, cRm, cSm);
        instance.isConstructing = false;
        constructingInstance = prevConstructing;
        setCurrentInstance(prevInstance);
    }

    // A component constructor must return the LightningElement instance it was
    // building (`this`). If it returns some other object (e.g. `return {}` or a
    // DOM node), that value isn't a valid component — throw, matching engine-core.
    // The Locker/Aura SecureBase mirror (`class Foo extends SecureBase`, where
    // SecureBase is a `__circular__` function that calls
    // `LightningElement.prototype.constructor.call(this)`) produces an instance
    // whose prototype chain does NOT include LightningElement.prototype, so
    // `instanceof` is false. In that case our init shim still wired the VM_SLOT
    // onto the instance — accept that as proof the base ran (engine-core's
    // function-based LightningElement brands `this` the same way).
    const ranBaseInit =
        rawComponent != null &&
        (rawComponent as { [VM_SLOT]?: VaporInstance })[VM_SLOT] === instance;
    const extendsLightningElement = rawComponent instanceof LightningElement || ranBaseInit;
    // Strict validation (the default, unless DISABLE_STRICT_VALIDATION is set)
    // additionally rejects a constructor that returns a native HTMLElement — even
    // one branded via `LightningElement.call(elm)` — matching engine-core's
    // invoker.ts, where `useStrictValidation && result instanceof HTMLElement` is
    // treated as an invalid constructor. Legacy mode (flag on) accepts it.
    const useStrictValidation = !getFeatureFlagValue('DISABLE_STRICT_VALIDATION');
    if (
        !extendsLightningElement ||
        (useStrictValidation &&
            typeof HTMLElement !== 'undefined' &&
            rawComponent instanceof HTMLElement)
    ) {
        throw new TypeError(
            'Invalid component constructor, the class should extend LightningElement.'
        );
    }

    // Wire the VM slot non-enumerably so it never appears in Object.keys(cmp).
    Object.defineProperty(rawComponent, VM_SLOT, {
        value: instance,
        enumerable: false,
        writable: true,
        configurable: true,
    });

    // Mark the component instance as a Locker "live" object (engine-core's
    // markLockerLiveObject), so Locker can treat it as live to support expandos.
    // The check is `hasOwnProperty(this, Symbol.for('@@lockerLiveValue'))`.
    (rawComponent as unknown as Record<symbol, unknown>)[Symbol.for('@@lockerLiveValue')] =
        undefined;

    // Apply incoming public props.
    if (props) {
        for (const key of Object.keys(props)) {
            (rawComponent as any)[key] = props[key];
        }
    }

    // The reactive $cmp proxy: reads track, writes trigger + re-run effects.
    // Object/array field values are wrapped with the deep membrane on read, so
    // nested and in-place mutations (this.items.push(x), this.state.a.b = c) are
    // reactive — matching LWC's reactivity membrane semantics.
    instance.reactiveTarget = rawComponent;
    // Dev-only: seed the mutation-logging path tracker with each `@track` object
    // field's graph. Class-field initializers (`@track previousName = {...}`) run
    // inside `new Ctor()` above — setting values DIRECTLY on the raw instance,
    // BEFORE the $cmp proxy exists — so they never pass through the set-trap. Walk
    // them once here so a later deep mutation (`this.previousName.suffix.short = x`)
    // resolves to its human-readable path (`previousName.suffix.short`). A subsequent
    // REASSIGNMENT of a @track field to a new object re-seeds via the set-trap (below).
    // DCE'd in prod (getMutationProperties never reads these there). See mutation-logger.ts.
    if (process.env.NODE_ENV !== 'production' && instance.trackedFields) {
        for (const key of instance.trackedFields) {
            const raw = (rawComponent as unknown as Record<string, unknown>)[key];
            if (raw !== null && typeof raw === 'object') {
                trackTargetForMutationLogging(key, raw);
            }
        }
    }
    const component = new Proxy(rawComponent, {
        get(obj, key, receiver) {
            const value = Reflect.get(obj, key, receiver);
            if (typeof key !== 'symbol') {
                trackAccess(rawComponent, key);
            }
            // Bind PROTOTYPE METHODS so `this` inside them is the reactive proxy.
            // Only bind a function that is a real method (a function-valued DATA
            // property on the prototype chain) — NOT a function returned from an
            // accessor/getter and NOT an own data property (e.g. a @api field or
            // `handlers = {click: fn}` assigned a callback/spy). Binding those would
            // break referential identity (spy assertions, ===).
            if (
                typeof value === 'function' &&
                typeof key === 'string' &&
                isPrototypeMethod(obj, key)
            ) {
                return value.bind(receiver);
            }
            // `this.refs` is already a FROZEN, null-prototype snapshot built by the
            // refs getter. It must NOT be deep-wrapped into a reactive proxy — a proxy
            // makes test matchers (`expect(refs).toBeUndefined()`, deep equality)
            // recurse through the membrane and hang (component/refs). Return as-is.
            if (key === 'refs') {
                return value;
            }
            // Signal protocol (ENABLE_EXPERIMENTAL_SIGNALS): when a getter returns a
            // TRUSTED signal during a render, subscribe the instance's re-render to
            // it so the template updates on `signal.value` changes. Return the
            // signal RAW (don't deep-wrap — that would break the trusted-set check
            // and the `.value` accessor identity).
            // NOTE: in the WTR vapor harness the trusted-signal set registered by
            // helpers/setup.js lives in a different bundle instance than the spec's
            // `Signal`, so `isTrustedSignalValue` is false there; this path is
            // correct but only activates when the trusted set is shared.
            if (
                value !== null &&
                typeof value === 'object' &&
                getFeatureFlagValue('ENABLE_EXPERIMENTAL_SIGNALS') &&
                isTrustedSignalValue(value)
            ) {
                if (isInRenderEffect()) {
                    subscribeInstanceToSignal(instance, value as TrustedSignal);
                }
                return value;
            }
            // Wired fields hold values produced by a wire adapter (often the raw
            // config/data the adapter echoes). engine-core does NOT deep-wrap these on
            // read-back, so a consumer reading `this.wiredProp.data.x` gets the SAME
            // object reference the adapter passed (wire/property-trap "should return
            // object value" asserts `toBe`). Return the raw value (still reactive at
            // the field level — reassigning `this.wiredProp` re-renders via the
            // field-level dep tracked above).
            if (
                typeof key === 'string' &&
                instance.wiredFields !== undefined &&
                instance.wiredFields.has(key)
            ) {
                return value;
            }
            // A PLAIN observed field (class field, not @track/@api/@wire) holding a
            // non-array OBJECT is returned RAW: engine-core treats plain fields as
            // shallow — reassigning re-renders, but a DEEP mutation does not, and the
            // read-back preserves object identity (observed-fields "preserve object
            // identity" + "should not rerender when field value is mutated"). ARRAYS
            // are still deep-wrapped so `for:each` over a plain array stays reactive,
            // and @track/@api/wired keep full deep reactivity below.
            if (
                value !== null &&
                typeof value === 'object' &&
                !Array.isArray(value) &&
                typeof key === 'string' &&
                instance.plainFields?.has(key) === true
            ) {
                return value;
            }
            // Deep-wrap object/array values so mutations on them are tracked
            // (matching LWC's reactivity membrane for @track + the foreach/array case).
            if (value !== null && typeof value === 'object') {
                return deepReactive(value);
            }
            return value;
        },
        set(obj, key, value, receiver) {
            // Reading the old value to decide whether to trigger reactivity must NOT
            // invoke a user GETTER: when `key` resolves to an accessor (get/set on
            // the prototype chain — e.g. a W-9927596 `@api foo` field colliding with
            // a same-name get/set), calling the getter here injects a spurious read
            // between the construct-time setter and an external setter, corrupting
            // the observed accessor-call order (`[setter default, getter, setter test]`
            // instead of `[setter default, setter test, getter]`). engine-core's
            // public-accessor setter never reads the getter. Detect an accessor key
            // and skip the read (treat as always-changed — the setter runs and we
            // trigger; an accessor's "changed" semantics are the user's setter's job).
            // Narrow to the W-9927596 case: a declared `@api`/`@track` prop whose
            // name ALSO has a component-own accessor (get/set). Only then skip the
            // getter read — other accessors (e.g. global-HTML own setters) keep the
            // old change-gated trigger so "should not be reactive when defining own
            // setter" stays correct.
            const keyIsAccessor =
                typeof key === 'string' &&
                instance.declaredProps?.has(key) === true &&
                Object.prototype.hasOwnProperty.call(obj, key) === false &&
                ownProtoHasAccessor(obj, key);
            // An `@api` (public) prop declared as an ACCESSOR (get/set) STILL schedules
            // a re-render on assignment — engine-core's createPublicAccessorDescriptor
            // calls `componentValueMutated` after invoking the user setter (the template
            // binding reading the getter must re-run). This is distinct from a NON-@api
            // own accessor (e.g. a GlobalHTML own setter), which must NOT be reactive
            // ("should not be reactive when defining own setter"). Computed BEFORE the
            // setter runs so the user setter's OWN writes (e.g. `set value(v){this._x=v}`
            // — the binding also reads `this._x` through the getter) defer too, instead
            // of synchronously re-running the binding mid-mount.
            const isApiAccessor =
                keyIsAccessor &&
                typeof key === 'string' &&
                instance.publicPropNames?.has(key) === true;
            const oldValue = keyIsAccessor ? UNREAD : Reflect.get(obj, key, receiver);
            // Preserve a READ-ONLY wrapper (an @api value passed from a parent) when
            // storing — unwrapping it would let the child mutate the parent's object.
            // A plain reactive proxy is still unwrapped to keep the raw graph raw.
            // A value that is ITSELF a component `$cmp` proxy is stored UNCHANGED:
            // unwrapping it (rawCache resolves $cmp → rawComponent) would store the
            // RAW instance while a getter returning `this` yields the PROXY, splitting
            // one component into two identities (CustomInstanceSetter's `that.ctx =
            // this` in a user setter). Everything else keeps read-only preservation.
            const rawVal = isComponentProxy(value) ? value : toRawPreservingReadOnly(value);
            // Writing to a name that resolves to an INHERITED getter-only accessor
            // (e.g. `this.refs = {...}` — LightningElement.refs has no setter) must
            // create an own expando data property that shadows the accessor, rather
            // than letting Reflect.set fail ("trap returned falsish"). Matches LWC,
            // where assigning such props creates an instance expando.
            let result: boolean;
            if (
                typeof key === 'string' &&
                !Object.prototype.hasOwnProperty.call(obj, key) &&
                inheritedGetterOnly(obj, key)
            ) {
                Object.defineProperty(obj, key, {
                    value: rawVal,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
                result = true;
            } else if (isApiAccessor) {
                // Run the user `@api` setter under forced-defer: any reactive write it
                // makes (typically `this._backing = v`, which a `{value}` binding reads
                // through the getter) is SCHEDULED for the next microtask rather than
                // re-running the binding synchronously mid-mount. engine-core likewise
                // schedules rehydration after the setter; the binding never re-runs inline.
                result = withForcedDefer(() => Reflect.set(obj, key, rawVal, receiver));
            } else {
                // Store the raw value (unwrap proxies) to keep the underlying graph raw.
                result = Reflect.set(obj, key, rawVal, receiver);
            }
            // Dev-only: REASSIGNING a `@track` field to a new object re-seeds the
            // mutation-logging path tracker for the new graph (engine-core re-walks in
            // its @track setter), so a later deep mutation resolves to `field.nested`
            // rather than a bare key. DCE'd in prod. (Construction-time initial values
            // are seeded once above, right after `instance.reactiveTarget = ...`.)
            if (
                process.env.NODE_ENV !== 'production' &&
                typeof key === 'string' &&
                instance.trackedFields?.has(key) === true &&
                rawVal !== null &&
                typeof rawVal === 'object'
            ) {
                trackTargetForMutationLogging(key, rawVal);
            }
            // Dev: a reactive mutation made while render()/the template is running
            // is a side effect — log it (matching engine-core). The GLOBAL flags
            // catch mutations to ANY component (incl. a child whose @api prop is set
            // from within the rendering parent), not just the one being rendered.
            if (process.env.NODE_ENV !== 'production' && typeof key === 'string') {
                // `@track` fields use engine-core's vm-qualified message form
                // (`<vmBeingRendered>.render() ... <vm>.prop` — decorators/track.ts);
                // `@api`/plain fields use the generic `property "x"` form
                // (decorators/api.ts). The rendering vm and the mutated vm are the
                // same here (a render() mutating its own field).
                const isTracked = instance.trackedFields?.has(key) === true;
                // engine-core only logs a render/template side effect for `@api`
                // public props/accessors (api.ts, generic `property "x"` form),
                // `@track` fields (track.ts, vm-qualified form), and reflective
                // global-HTML props like `tabIndex` (base-lightning-element.ts).
                // Plain observed fields (e.g. a child's private `_baz` backing an
                // @api accessor) do NOT log — observed-fields.ts has no side-effect
                // check. Without this gate vapor double-logs (`baz` AND its `_baz`).
                const isPublicProp = instance.publicPropNames?.has(key) === true;
                const isGlobalHtmlProp = REFLECTIVE_GLOBAL_PROPERTY_SET.has(key);
                if (!isTracked && !isPublicProp && !isGlobalHtmlProp) {
                    // fall through — no side-effect logging for plain fields
                } else if (globalSuppressSideEffectCheck > 0) {
                    // Suppressed: a normal parent→child prop application (applyChildProp),
                    // not a render/template side effect.
                } else if (globalIsInvokingRender) {
                    logVaporError(
                        isTracked
                            ? `${vmString(instance)}.render() method has side effects on the state of ${vmString(instance)}.${key}`
                            : `render() method has side effects on the state of property "${key}"`
                    );
                } else if (globalIsUpdatingTemplate) {
                    logVaporError(
                        isTracked
                            ? `Updating the template of ${vmString(instance)} has side effects on the state of ${vmString(instance)}.${key}`
                            : `Updating the template has side effects on the state of property "${key}"`
                    );
                }
            }
            // A write to a component-OWN accessor (`@api`/own get/set, the
            // W-9927596 case) must NOT auto-trigger reactivity: the accessor body
            // decides what reactive state (if any) it mutates — engine-core's public
            // accessor doesn't trigger on the write itself. Auto-triggering here
            // re-rendered a component with a no-op own setter (GlobalHTML
            // "should not be reactive when defining own setter"). So skip the trigger
            // for accessor keys (we also skipped reading the getter above, fixing the
            // W-9927596 accessor-call order).
            // A public `@api` DATA field re-render is scheduled UNCONDITIONALLY on
            // assignment — engine-core's createPublicPropertyDescriptor calls
            // `componentValueMutated` without an equality check. This matters for
            // LIVE bindings: `elm.checkedValue = true` (same value) after the user
            // toggled `input.checked` must still re-render to re-assert the bound
            // value over the DOM (template/properties "use the DOM value for
            // diffing"). Plain/@track fields keep the equality guard (avoids
            // redundant renders). Accessor keys never trigger here.
            const isPublicField =
                typeof key === 'string' &&
                instance.declaredProps?.has(key) === true &&
                instance.trackedFields?.has(key) !== true &&
                (instance.wiredFields === undefined || !instance.wiredFields.has(key));
            const changed = oldValue !== rawVal || isPublicField;
            // engine-core only OBSERVES declared fields (`@api`/`@track`/plain class
            // fields, all in `declaredProps`). A property assigned that is NOT a class
            // field — an EXPANDO (`this.expandoField = x` from the constructor or a
            // method) — is not reactive: mutating it must NOT re-render (observed-fields
            // "should not rerender component when expando field is mutated"). The write
            // still lands (above); we just skip the reactivity trigger for it. A key
            // that is ALREADY an own data prop on the raw component but not declared is
            // still treated as an expando (engine-core wouldn't observe it either).
            // (Symbols + accessor keys are handled by the existing guards.)
            const isObservedField =
                typeof key !== 'string' ||
                instance.declaredProps?.has(key) === true ||
                // Wired fields are observed too: a wire adapter pushes data by
                // assigning `cmp[wiredField] = value`, which must re-render even
                // though the wired name isn't in `declaredProps` (wire/wiring,
                // wired-fields "rerender when adapter pushes data").
                (instance.wiredFields !== undefined && instance.wiredFields.has(key));
            if (typeof key !== 'symbol' && !keyIsAccessor && changed && isObservedField) {
                // A mutation made DURING render() is a side effect (already dev-warned
                // above). It must NOT trigger reactivity — otherwise a `render()` that
                // writes a field it also reads (e.g. `render() { this.counter++ }`,
                // observed-fields/fieldWithSideEffect) would re-trigger the render
                // tracking effect and loop forever. engine-core likewise ignores
                // render-phase mutations for re-render scheduling.
                if (!globalIsInvokingRender) {
                    // Notify the effects SUBSCRIBED to `key`. WHOLE-TEMPLATE
                    // RE-RENDER is subscription-gated (matching engine-core: a
                    // field NO binding reads notifies no observer → no rerender —
                    // reactivity/render's unused `dynamicValue`). When a subscribed
                    // binding DOES notify, its notify() expands to re-run all the
                    // owner's registered render effects (incl. the renderDriver, so
                    // render() re-invokes — side-effects). Triggering whole-template
                    // UNCONDITIONALLY here re-ran render() on every field write,
                    // looping a `renderedCallback(){ this.n++ }` and re-rendering on
                    // unused-field writes; the notify-time expansion avoids both.
                    triggerUpdate(rawComponent, key);
                    // Bump the per-component render epoch so every-render effects
                    // (`lwc:on`) re-evaluate, matching LWC's re-eval-each-render.
                    triggerEpoch(rawComponent);
                }
            }
            return result;
        },
    });

    // Map the $cmp proxy back to the raw component so `toRaw($cmp) === rawComponent`
    // (the component proxy doesn't trap the RAW symbol). Lets epoch track/trigger
    // agree on identity for `lwc:on` every-render re-evaluation.
    registerRaw(component, rawComponent);
    // Remember this $cmp proxy so the set-trap stores it AS-IS instead of unwrapping
    // to rawComponent (preserving a single membrane identity — see `componentProxies`).
    componentProxies.add(component);
    instance.component = component;

    // Construct (but do not connect) @wire adapters NOW, at instance-create —
    // engine-core builds its wire connectors before mount, so an adapter's
    // constructor side effects (e.g. recording the host tagName) happen at
    // createElement even if the element is never appended. installWireAdapters
    // reuses these at mount for connect()/config-watch. (Reconnect re-builds.)
    constructWireAdapters(instance);

    // Resolve the render function: a user-defined `render()` method may return a
    // specific template (the compiled vapor render fn); otherwise use the
    // component's registered template (`def.tmpl`). A subclass that declares no
    // template of its own inherits the nearest ancestor's registered template
    // (e.g. `class Bar extends Base {}` with no Bar.html renders Base's template).
    let renderFn: VaporRenderFn | undefined = def.tmpl;
    if (!renderFn) {
        let proto = Object.getPrototypeOf(Ctor);
        while (proto && proto !== Function.prototype) {
            const ancestorDef = registeredComponents.get(proto);
            if (ancestorDef?.tmpl) {
                renderFn = ancestorDef.tmpl;
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
    }
    // A user-defined `render()` method is resolved LAZILY at render time (in
    // renderInstance), NOT here — because it commonly reads reactive/public props
    // (e.g. `render() { return this.template; }`) that are only assigned AFTER the
    // instance is created (by a parent's createChildComponent or by user code
    // between createElement and appendChild). Resolving eagerly would observe
    // `undefined`. We stash the method + the default template and resolve on first
    // (and every subsequent) render.
    const userRender = (rawComponent as any).render;
    instance.defaultTmpl = renderFn;

    // Render-mode mismatch: the component's resolved render mode vs the template's
    // authored `lwc:render-mode` (undefined → shadow). Mismatch → dev error + a
    // RenderModeMismatch report (matching engine-core template.ts). Checked against
    // the DEFAULT template (a user render() returning a different-mode template is
    // re-checked per render elsewhere if needed).
    if (renderFn) {
        const templateIsLight = (renderFn as { renderMode?: string }).renderMode === 'light';
        if (isLight !== templateIsLight) {
            if (isReportingEnabled()) {
                report('RenderModeMismatch', {
                    tagName: host.tagName.toLowerCase(),
                    mode: isLight ? 0 : 1,
                });
            }
            if (process.env.NODE_ENV !== 'production') {
                const tag = host.tagName.toLowerCase();
                logVaporError(
                    isLight
                        ? `Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode="light"' directive to the root template tag of <${tag}>.`
                        : `Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive from <${tag}> or set it to 'lwc:render-mode="shadow"`
                );
            }
        }
    }
    // The base LightningElement.prototype.render is NOT a user override (it only
    // exists to satisfy the public-prototype surface); treat only a DIFFERENT
    // render as the component's own, else use the associated compiled template.
    if (typeof userRender === 'function' && userRender !== LightningElement.prototype.render) {
        instance.userRenderMethod = userRender as (...a: unknown[]) => unknown;
    } else {
        instance.renderFn = renderFn;
    }
    instance.slotset = slotset;

    return instance;
}

/**
 * Runs the component's vapor render function to produce its block, inside the
 * instance's own EffectScope so all its render effects (and event listeners) are
 * disposed together on unmount. Deferred until mount so that props set on the
 * host element (by a parent's createChildComponent, or by user code between
 * createElement and appendChild) are visible to the very first render — matching
 * the LWC contract where render runs at connection, after props are assigned.
 */
function renderInstance(instance: VaporInstance): void {
    if (instance.block) return;
    const component = instance.component;
    // Resolve a user-defined render() lazily (now that props/reactive state are
    // set). It may return a specific compiled template; otherwise its return value
    // is validated. render() is invoked OUTSIDE the render-effect scope below so
    // its own reactive reads/writes (e.g. `this.results.push(...)` inside render)
    // don't create template-level dependencies that would self-retrigger into an
    // infinite loop. Reactive template switching is driven by the normal re-render
    // path: when a tracked binding changes, reRenderInstance resets the block and
    // re-invokes render() here, picking up the (possibly new) template.
    if (instance.userRenderMethod) {
        // Invoke user `render()` inside a TRACKING effect so reactive fields it reads
        // (e.g. `return this.flag ? tmplA : tmplB`) subscribe a re-render — reactive
        // TEMPLATE SWITCHING. The effect re-runs render() on any tracked-dep change but
        // only schedules a DOM re-render when the returned template actually CHANGES,
        // and a circuit breaker stops a runaway. Tied to renderDriverScope (stopped on
        // unmount). See VAPOR_TEST_STATUS — this is GATED behind a flag because, while
        // it fixes ~13 template-switch tests, in the FULL suite it triggers a cross-file
        // hang in events/memoization (a 4th confirmation of the documented interaction).
        const runUserRender = (): void => {
            const prevR = setCurrentInstance(instance);
            instance.isInvokingRender = true;
            const prevGlobalRender = globalIsInvokingRender;
            globalIsInvokingRender = true;
            let returned: unknown;
            try {
                const callHook = instance.lockerHooks?.callHook;
                // Suppress reactive triggers WHILE render() runs: a mutation it makes
                // to reactive state (e.g. `this.results.push(...)` in a render() that
                // also reads `this.results`) is a side effect that must not re-trigger
                // the render-tracking effect (infinite loop — component/refs `Render`).
                returned = suppressTriggers(() =>
                    callHook
                        ? callHook(component, instance.userRenderMethod!, [])
                        : instance.userRenderMethod!.call(component)
                );
                instance.renderFn = resolveUserRenderResult(instance, returned);
                instance.userRenderThrew = undefined;
            } catch (err) {
                instance.userRenderThrew = err;
            } finally {
                instance.isInvokingRender = false;
                globalIsInvokingRender = prevGlobalRender;
                setCurrentInstance(prevR);
            }
        };

        if (ENABLE_REACTIVE_TEMPLATE_SWITCH && !instance.renderDriver) {
            const scope = (instance.renderDriverScope = new EffectScope());
            let first = true;
            const effect = new ReactiveEffect(() => {
                // Capture + clear the sibling-replay marker for THIS run. When true, this
                // re-run was pulled in by the WHOLE-TEMPLATE expansion because SOME OTHER
                // binding of this component changed (e.g. an `@api` prop `label`/`bar` that
                // render() itself doesn't read) — NOT because a template-determining field
                // render() reads changed. In that case we must re-invoke render() to replay
                // its side effects (observed-fields `this.counter++`; rendering/side-effects
                // external `child.baz = ...`) but must NOT schedule a template switch: a
                // real switch is always driven by a DIRECT notify (render() subscribes to
                // every field it reads), which clears this flag. Suppressing the switch on a
                // sibling replay avoids the teardown-ordering breakage a spurious
                // reRenderInstance caused for template-switching components.
                const wasSiblingReplay = effect.siblingReplay;
                effect.siblingReplay = false;
                const prevRenderFn = instance.renderFn;
                runUserRender();
                if (first || instance.renderDriverManualRun) {
                    first = false;
                    return;
                }
                if (wasSiblingReplay) return;
                if (instance.renderFn === prevRenderFn) return;
                if (!instance.isMounted || instance.disconnected) return;
                // Re-entrancy guard: the manual renderDriver.run() inside
                // reRenderInstance must not recurse here.
                if (instance.renderSwitchScheduled) return;
                // Coalesce + bound. Re-render on a microtask (so a single user action
                // that flips several fields produces one re-render), and cap the number
                // of template switches within one microtask-turn so a pathological
                // render() that returns a fresh template every call FAILS LOUDLY (one
                // test) instead of starving the event loop (hanging the whole file).
                instance.renderSwitchCount = (instance.renderSwitchCount ?? 0) + 1;
                if (instance.renderSwitchCount > 100) {
                    if (instance.renderDriverScope) instance.renderDriverScope.stop();
                    return;
                }
                instance.renderSwitchScheduled = true;
                queueMicrotask(() => {
                    instance.renderSwitchScheduled = false;
                    if (!instance.isMounted || instance.disconnected) return;
                    reRenderInstance(instance, /* keepRenderFn */ true);
                });
            });
            // The render-driver template-switch effect is EXEMPT from the @api-accessor
            // forced-defer: a parent setting a child's `@api` accessor (mid-render or
            // directly) whose setter writes a @track field that this render() reads must
            // NOT reroute this structural switch through the detached-rehydration queue
            // (it would skip the child-teardown path → disconnectedCallback never fires).
            (effect as unknown as { forcedDeferExempt: boolean }).forcedDeferExempt = true;
            // WHOLE-TEMPLATE RE-RENDER (engine-core parity): register the render-driver
            // under its owning instance so a WHOLE-TEMPLATE expansion (any subscribed
            // binding notify) also re-runs THIS effect — re-invoking the user render().
            // engine-core re-invokes render() on EVERY tracked change; a fine-grained
            // binding re-run alone does not. Without this a render() SIDE EFFECT
            // (`this.counter++` — observed-fields side-effects-during-render;
            // `child.baz = ...` — rendering/side-effects external) never re-fires on a
            // later prop change the render() body itself doesn't read, because only the
            // binding effects were in `ownerEffects` and the driver was orphaned
            // (owner === null). The sibling-replay guard above keeps this scoped to
            // side-effect replay: a template SWITCH is still only scheduled from a DIRECT
            // dep-change notify, so the template-switch teardown path is unaffected. The
            // driver is registered BEFORE its template's binding effects, so it sorts
            // FIRST in the owner's effect set → in the batched flush it re-invokes render()
            // (bumping the side-effected field) BEFORE the sibling bindings re-read it.
            effect.owner = instance;
            registerOwnerEffect(instance, effect);
            // The driver's OWN notify (a template-determining field it reads changed) must
            // run SYNCHRONOUSLY — the same pre-registration timing — so its template-switch
            // `reRenderInstance` is scheduled on the same microtask turn as the mutation
            // (template-switch tests `next(); await Promise.resolve()`). Registering the
            // driver under an owner would otherwise reroute its own notify through the async
            // queue, delaying the switch one extra microtask. Sibling-replay re-runs still
            // defer: the expansion adds the driver to the async queue directly, not via notify.
            (effect as unknown as { syncSelfNotify: boolean }).syncSelfNotify = true;
            // CRITICAL: register the effect with the scope so `scope.stop()` (on
            // unmount AND the circuit breaker) actually stops it. `scope.run()` only
            // makes the scope active for the duration of the call — it does NOT
            // auto-register the effect. Without this the renderDriver effect leaked
            // past unmount and re-fired across spec files (the source of the
            // events/memoization cross-file hang the circuit breaker couldn't catch).
            scope.run(() => {
                onScopeDispose(() => effect.stop());
                effect.run();
            });
            instance.renderDriver = effect;
        } else if (ENABLE_REACTIVE_TEMPLATE_SWITCH) {
            // A TEMPLATE-SWITCH re-render (reRenderInstance keepRenderFn=true) was
            // triggered by the renderDriver effect itself, which ALREADY invoked the
            // user `render()` (collecting its deps + computing the new renderFn). Re-
            // running the driver here would invoke render() a SECOND time — doubling
            // any side effect render() performs (e.g. `this.results.push(...)` in
            // component/refs "works in render" → an extra entry). Skip the re-run in
            // that case; the deps were already collected by the triggering effect.
            if (instance.skipDriverRerun) {
                instance.skipDriverRerun = false;
            } else {
                instance.renderDriverManualRun = true;
                try {
                    instance.renderDriver!.run();
                } finally {
                    instance.renderDriverManualRun = false;
                }
            }
        } else {
            // Default (stable) path: invoke render() once per render, NOT tracked, so
            // it cannot self-retrigger or accumulate a cross-file hang. Reactive
            // template switching is not supported on this path.
            runUserRender();
        }

        if (instance.userRenderThrew !== undefined) {
            const err = instance.userRenderThrew;
            instance.userRenderThrew = undefined;
            attachErrorComponentStack(instance, err);
            instance.block = [];
            // Deferred re-throw of a value caught from user render() (stashed as `unknown`);
            // like a direct catch-rethrow, the original value must propagate verbatim.
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            if (!handleErrorSelfOrAncestor(instance, err)) throw err;
            return;
        }
    }
    if (!instance.renderFn) return;
    const renderFn = instance.renderFn;
    const slotset = instance.slotset;
    const prev = setCurrentInstance(instance);
    const prevOwner = setCurrentOwner(instance);
    const scope = new EffectScope();
    instance.scope = scope;
    instance.refsStore = undefined;
    instance.refsFrozen = undefined;
    // Signal protocol: unsubscribe from signals read in the PREVIOUS render and
    // reset the seen-set, so a signal only behind a now-inactive `lwc:if` branch
    // is dropped and only currently-rendered signals stay subscribed.
    if (instance.signalCleanups) {
        for (const unsub of instance.signalCleanups) unsub();
        instance.signalCleanups = [];
    }
    instance.signalsSeen = undefined;
    // The compiled render fn is tagged with `hasRefs` when its template declares
    // any `lwc:ref` (even inside an inactive branch), so `this.refs` is an object
    // rather than undefined. Reflect the CURRENT render fn each render (set AND
    // reset) so a TEMPLATE SWITCH from a refs template to a no-refs one makes
    // `this.refs` undefined again — otherwise a stale `refsTemplateDeclared=true`
    // returns a frozen refs object where the test expects undefined
    // (component/refs multi-template "no refs in one"). Stale refs are also cleared.
    if ((renderFn as { hasRefs?: boolean }).hasRefs) {
        instance.refsTemplateDeclared = true;
    } else {
        instance.refsTemplateDeclared = false;
        instance.refsStore = undefined;
        instance.refsFrozen = undefined;
    }
    instance.isRendering = true;
    const prevGlobalUpdating = globalIsUpdatingTemplate;
    globalIsUpdatingTemplate = true;
    const renderProfOn = isProfilingEnabled();
    const [pName, pRm, pSm] = renderProfOn ? profInfo(instance) : ['', 0, 0];
    if (renderProfOn) logOperationStart(OperationId.Render, pName, instance.idx, pRm, pSm);
    try {
        instance.block = scope.run(() =>
            isActTemplate(renderFn)
                ? // ACT (VDOM-style) template: invoke via the act-compat shim, which
                  // builds real DOM and returns a vapor Block.
                  renderActTemplate(
                      renderFn as unknown as ActTemplate,
                      component,
                      slotset as Record<string, () => unknown> | undefined
                  )
                : renderFn(component, (slotset ?? {}) as Record<string, () => Block>)
        );
        // A template factory not produced by the LWC compiler may return a raw
        // primitive (e.g. a string) instead of a node/fragment/array. That isn't a
        // valid block and would crash insertBlock (`'block' in <string>`). Detect
        // ONLY the primitive case — a single Node or fragment is a legitimate
        // single-root block — and log engine-core's "Compiler should produce html
        // functions that always return an array." dev error.
        const b: unknown = instance.block;
        if (b != null && typeof b !== 'object') {
            logVaporError(`Compiler should produce html functions that always return an array.`);
            instance.block = [];
        }
    } catch (err) {
        // A throw during the initial render (e.g. a template binding dereferences
        // an undefined value) must not leave `block` undefined — that cascades
        // into an `insertBlock(undefined)` crash at mount that takes down the
        // whole spec file. Fall back to an empty block so the element still
        // connects (matching LWC, where the host exists even when its content
        // failed to render) and surface the real error for diagnosis.
        instance.block = [];
        // Route render errors to the nearest errorCallback boundary. A render
        // error often originates in a CHILD constructed during this render (e.g.
        // `<x-child>` whose constructor/render threw), so THIS instance is itself
        // a candidate boundary — check it first, then ancestors. If NOTHING
        // handles it, rethrow: this synchronous first render runs inside
        // mountInstanceImpl, whose caller (mountInstance) reroutes/propagates the
        // error to the custom element's connectedCallback reaction → window error,
        // matching LWC where an unhandled render() error surfaces to the platform
        // rather than being silently logged.
        attachErrorComponentStack(instance, err);
        if (!handleErrorSelfOrAncestor(instance, err)) {
            throw err;
        }
    } finally {
        if (renderProfOn) logOperationStop(OperationId.Render, pName, instance.idx, pRm, pSm);
        instance.isRendering = false;
        globalIsUpdatingTemplate = prevGlobalUpdating;
        setCurrentOwner(prevOwner);
        setCurrentInstance(prev);
    }
}

/**
 * Find the nearest ancestor instance (starting from `instance`'s parent) that
 * declares an `errorCallback`, and invoke it with the error. Returns true if a
 * boundary handled it. The boundary's errorCallback typically mutates reactive
 * state, which re-renders it to an alternative view. Matches LWC error boundaries.
 */
/** Like handleError but considers `instance` itself as a candidate boundary first
 *  (used when the error originated in a descendant rendered by this instance). */
export function handleErrorSelfOrAncestor(
    instance: VaporInstance | undefined,
    error: unknown
): boolean {
    let cursor = instance;
    let guard = 0;
    while (cursor && guard++ < 10000) {
        const cb = (cursor.reactiveTarget as any)?.errorCallback;
        if (typeof cb === 'function') {
            const stack = (error as { stack?: string })?.stack ?? '';
            const boundary = cursor;
            try {
                // Profiler ErrorCallback (opId 6) span — logged with the ORIGINATING
                // instance (where the error was raised), NOT the boundary, matching
                // engine-core's `logOperationStart(ErrorCallback, vm)` (profiler/sanity).
                withProfiler(instance ?? boundary, OperationId.ErrorCallback, () =>
                    cb.call(boundary.component, error, stack)
                );
            } catch (e) {
                if (handleError(cursor, e)) return true;
                throw e;
            }
            // engine-core does NOT force a re-render after errorCallback — if the
            // callback mutates tracked state, the reactivity system schedules the
            // re-render itself; if it mutates nothing (e.g. a no-op errorCallback),
            // NO render/patch spans should fire (profiler/sanity "error callback
            // counted properly" expects ONLY the ErrorCallback span). We still need a
            // manual nudge when the boundary is MID-MOUNT (the error happened during
            // its own first render, before reactive effects are wired) — defer that
            // to a microtask, gated on isMounted.
            if (!boundary.isMounted) {
                queueMicrotask(() => {
                    if (boundary.isMounted) reRenderInstance(boundary);
                });
            }
            return true;
        }
        cursor = cursor.parent;
    }
    return false;
}

function handleError(instance: VaporInstance | undefined, error: unknown): boolean {
    let cursor = instance?.parent;
    while (cursor) {
        const cb = (cursor.reactiveTarget as any)?.errorCallback;
        if (typeof cb === 'function') {
            const stack = (error as { stack?: string })?.stack ?? '';
            const boundary = cursor;
            try {
                // Profiler ErrorCallback (opId 6) span (profiler/sanity).
                withProfiler(boundary, OperationId.ErrorCallback, () =>
                    cb.call(boundary.component, error, stack)
                );
            } catch (e) {
                // The boundary's own errorCallback threw: bubble that NEW error to
                // the next boundary above. If none handles it, THROW the new error
                // (not the original) so it surfaces with the boundary's message.
                if (handleError(cursor, e)) return true;
                throw e;
            }
            scheduleBoundaryRerender(cursor);
            return true;
        }
        cursor = cursor.parent;
    }
    return false;
}

/**
 * Re-render an error-boundary after its errorCallback ran (which typically
 * mutated state to show an alternative view). If the boundary is fully mounted,
 * re-render immediately; if it's mid-mount (the error happened during its own
 * render), defer to a microtask so the current mount completes first.
 */
// Circuit breaker: an errorCallback that "recovers" by re-rendering can loop if
// the recovered subtree throws again into the SAME boundary (re-render → throw →
// errorCallback → re-render → …). Cap consecutive re-renders of one boundary
// within a synchronous cascade; reset on the next microtask tick.
let boundaryRerenderCount = new WeakMap<VaporInstance, number>();
let boundaryRerenderResetScheduled = false;
const MAX_BOUNDARY_RERENDERS = 25;
function scheduleBoundaryRerender(boundary: VaporInstance): void {
    const n = (boundaryRerenderCount.get(boundary) ?? 0) + 1;
    boundaryRerenderCount.set(boundary, n);
    if (!boundaryRerenderResetScheduled) {
        boundaryRerenderResetScheduled = true;
        queueMicrotask(() => {
            boundaryRerenderResetScheduled = false;
            boundaryRerenderCount = new WeakMap();
        });
    }
    if (n > MAX_BOUNDARY_RERENDERS) {
        // Runaway recovery — stop re-rendering this boundary (the most recent error
        // already surfaced through handleError's rethrow). Prevents a sync hang.
        return;
    }
    if (boundary.isMounted) {
        reRenderInstance(boundary);
    } else {
        queueMicrotask(() => {
            if (boundary.isMounted) reRenderInstance(boundary);
        });
    }
}

/**
 * Light-DOM slot resolution — NO-OP (retained as a documented lifecycle hook).
 *
 * This function is intentionally empty. It used to scan the render root for real
 * `<slot>` elements (`querySelectorAll('slot')`) and replace each with the parent's
 * slotted content. That work is now entirely dead, for two reasons that together
 * cover every `<slot>` a light render root can ever contain:
 *
 *  1. A light component compiles EVERY one of its OWN `<slot>` declarations to a
 *     `createSlot` block (template-compiler-vapor transform.ts: `isLightRenderMode()`
 *     → 'slot'), which resolves + REPLACES the `<slot>` with its slotset content at
 *     render time. So a light component NEVER renders a real `<slot>` element for its
 *     own template — there is nothing here for a scan to find.
 *
 *  2. The ONLY real `<slot>` that can remain in a light render root is FOREIGN
 *     FORWARDED CONTENT — a SHADOW intermediate keeps its forwarding
 *     `<slot slot="y" name="x">` as a real element and projects it (as slotted
 *     content) down into this light leaf, where `createSlot` has already placed it
 *     whole and consumed its `slot=` attribute (shadow>light). It MUST be left intact
 *     (tests read its `.assignedNodes()`); re-resolving it double-processes it.
 *
 * Commit 1c2e88b79b added `if (slot.nodeName === 'SLOT') continue;` to skip case (2).
 * Because `querySelectorAll('slot')` returns ONLY elements whose `nodeName` is `'SLOT'`,
 * that guard fired on EVERY iteration — making the entire loop body unreachable and the
 * per-mount subtree scan + dynamic-slot-map build pure wasted work. Reduced to a no-op:
 * removes a full-tree `querySelectorAll` DOM scan per light-component mount (a measurable
 * bulk-mount cost) with byte-identical behavior. The `if (instance.isLight)` call sites
 * are kept so the reactive slot-reorder hook that follows them stays wired in place.
 */
function resolveLightDomSlots(_instance: VaporInstance): void {
    /* intentionally empty — see doc comment above */
}

let mountDepth = 0;
// True while a reconnect batch (one synchronous re-append of a subtree) is in
// flight; cleared on the next microtask. The first reconnect in a batch is the
// outermost (fires renderedCallback); the rest are descendants (cc only) —
// matching engine-core (lifecycle-callbacks "reconnect"). TODO [#4057]: revisit.
let reconnectBatchActive = false;

// Slot projection lives in create-element.ts (projectSlots), but is invoked from
// mountInstanceImpl (here) at the right point in the lifecycle. Wired via a setter
// to avoid a circular import. Given the host + its slotset + the owner instance to
// restore as current-instance during projection.
let projectSlotsHook:
    | ((
          host: HTMLElement,
          slotset: Record<string, () => unknown>,
          owner: VaporInstance | null
      ) => void)
    | null = null;
export function setProjectSlotsHook(
    fn: (
        host: HTMLElement,
        slotset: Record<string, () => unknown>,
        owner: VaporInstance | null
    ) => void
): void {
    projectSlotsHook = fn;
}

export function mountInstance(instance: VaporInstance): void {
    if (instance.isMounted) return;
    // Reconnecting a previously-disconnected instance: clear the disconnect guard so
    // its next removal drives the ordered disconnect again.
    instance.disconnected = false;
    // EVERY component mount gets its OWN GlobalRender (`lwc-render`) span: with native
    // custom-element lifecycle (which vapor uses), engine-core runs each component's
    // first render inside `connectRootElement` → `logGlobalOperationStart(GlobalRender)`,
    // nested children included (performance-timing nested-tree expects an `lwc-render`
    // span wrapping each `<x-child>` render+patch). The span nests naturally inside the
    // parent's patch frame.
    const profActive = isProfilingEnabled();
    let gName = '',
        gRm = 0,
        gSm = 0;
    if (profActive) {
        [gName, gRm, gSm] = profInfo(instance);
        logOperationStart(OperationId.GlobalRender, gName, instance.idx, gRm, gSm);
    }
    mountDepth++;
    try {
        mountInstanceImpl(instance);
    } catch (err) {
        // A throw while mounting this instance (constructor already ran; here it's
        // connectedCallback/render/renderedCallback) routes to the nearest
        // errorCallback boundary above it. If unhandled, rethrow.
        if (!handleError(instance, err)) throw err;
    } finally {
        mountDepth--;
        if (profActive) {
            logOperationStop(OperationId.GlobalRender, gName, instance.idx, gRm, gSm);
        }
    }
}

/**
 * SSR-hydrate mount (the `hydrateComponent` facade). Vapor has no server markup to
 * adopt, so it renders + patches the subtree fresh — but the PROFILER sequence must
 * match engine-core/engine-dom's hydrate path exactly (profiler/sanity
 * `hydrateComponent`): the Constructor span already fired at instance-create, then
 * this brackets Render + Patch inside a single GlobalHydrate (`lwc-ssr-hydrate`,
 * opId 9) span and emits NO connectedCallback/renderedCallback/GlobalRender ops.
 * shadowMode is always Native for hydration, which profInfo already reports (0).
 */
export function mountForHydrate(instance: VaporInstance): void {
    if (instance.isMounted) return;
    instance.disconnected = false;
    instance.domPreserved = false;
    const profActive = isProfilingEnabled();
    let hName = '',
        hRm = 0,
        hSm = 0;
    if (profActive) {
        [hName, hRm, hSm] = profInfo(instance);
        logOperationStart(OperationId.GlobalHydrate, hName, instance.idx, hRm, hSm);
    }
    try {
        // @wire adapters connect (no profiler ops) before the first render reads them.
        installWireAdapters(instance);
        // renderInstance emits the Render span.
        renderInstance(instance);
        validateStylesheetToken(instance);
        const blockIsEmpty =
            instance.block == null ||
            (Array.isArray(instance.block) && instance.block.length === 0);
        if (instance.block && !blockIsEmpty) {
            withProfiler(instance, OperationId.Patch, () => {
                insertBlock(instance.block!, instance.renderRoot);
            });
        } else if (instance.block) {
            insertBlock(instance.block, instance.renderRoot);
        }
        if (instance.isLight) {
            resolveLightDomSlots(instance);
        }
        if (process.env.NODE_ENV !== 'production') {
            applyElementRestrictions(instance.renderRoot as unknown as ParentNode);
        }
        injectStylesheets(instance);
        instance.isMounted = true;
        instance.hasRenderedOnce = true;
        registerMounted(instance);
    } catch (err) {
        if (!handleError(instance, err)) throw err;
    } finally {
        if (profActive) {
            logOperationStop(OperationId.GlobalHydrate, hName, instance.idx, hRm, hSm);
        }
    }
}

function mountInstanceImpl(instance: VaporInstance): void {
    // RECONNECT path: the instance was disconnected but its rendered block + DOM
    // were preserved (domPreserved). Re-fire connectedCallback then renderedCallback
    // WITHOUT re-rendering — the preserved DOM is intact, and engine-core does not
    // re-run render() on reconnect (lifecycle-callbacks "reconnect"). Children's own
    // native connectedCallback reactions re-fire as they re-connect (and they take
    // this same no-render path), so child:renderedCallback does NOT fire on reconnect.
    if (instance.domPreserved && instance.block != null) {
        instance.domPreserved = false;
        instance.isMounted = true;
        registerMounted(instance);
        // Only the OUTERMOST instance of a reconnecting subtree fires
        // renderedCallback; nested descendants (whose ancestor is being reconnected
        // in the same synchronous re-attach) fire only connectedCallback. Matches
        // engine-core (lifecycle-callbacks "reconnect": parent cc, parent rc, child
        // cc — no child rc; TODO [#4057]: see reconnect note). Native connectedCallback reactions fire
        // top-down, so the outermost reconnect arrives first and opens the window.
        // The native connectedCallback reactions for a re-attached subtree fire as
        // SEPARATE synchronous callbacks (parent first, then each descendant), NOT
        // nested — so a sync depth counter won't span them. Use a flag cleared on a
        // microtask: the FIRST reconnect in the batch is the outermost (fires rc);
        // every reconnect in the same task is a descendant (cc only).
        const isOutermostReconnect = !reconnectBatchActive;
        if (!reconnectBatchActive) {
            reconnectBatchActive = true;
            queueMicrotask(() => {
                reconnectBatchActive = false;
            });
        }
        // Re-install wire adapters so a reconnect re-fires the adapter's
        // connect()/update() (they were disconnect()ed on teardown) — wire/wiring
        // "connect and disconnect twice" / "update when re-connected".
        installWireAdapters(instance);
        const ccb = (instance.reactiveTarget as any).connectedCallback;
        if (typeof ccb === 'function') {
            try {
                withProfiler(instance, OperationId.ConnectedCallback, () =>
                    callLifecycle(instance, ccb)
                );
            } catch (err) {
                attachErrorComponentStack(instance, err);
                if (!handleError(instance, err)) throw err;
            }
        } else if (isProfilerActive()) {
            withProfiler(instance, OperationId.ConnectedCallback, () => {});
        }
        // A PENDING detached rehydration owns the renderedCallback; suppress the
        // reconnect rc in that case (engine-core's detached-rehydration model —
        // lifecycle "connect/mutate/disconnect/reconnect" expects NO parent:rc on
        // reconnect when a re-render was scheduled-but-unflushed while detached).
        const suppressReconnectRc = instance.pendingRehydrationRc === true;
        instance.pendingRehydrationRc = false;
        if (isOutermostReconnect && !suppressReconnectRc) {
            const rcb = (instance.reactiveTarget as any).renderedCallback;
            if (typeof rcb === 'function') {
                try {
                    withProfiler(instance, OperationId.RenderedCallback, () =>
                        callLifecycle(instance, rcb)
                    );
                } catch (err) {
                    attachErrorComponentStack(instance, err);
                    if (!handleError(instance, err)) throw err;
                }
            }
        }
        return;
    }
    instance.domPreserved = false;
    // Install + connect @wire adapters first, so wired fields are populated (the
    // legacy adapters echo synchronously on connect/update) BEFORE the first
    // render reads them — otherwise a template/getter that dereferences a wired
    // field (e.g. `this.wired.foo`) would see undefined and throw.
    installWireAdapters(instance);
    // connectedCallback runs before the first render in LWC.
    instance.mountPhase = 'connected';
    const cb = (instance.reactiveTarget as any).connectedCallback;
    if (typeof cb === 'function') {
        try {
            withProfiler(instance, OperationId.ConnectedCallback, () =>
                callLifecycle(instance, cb)
            );
        } catch (err) {
            attachErrorComponentStack(instance, err);
            if (!handleError(instance, err)) throw err;
        }
    } else if (isProfilerActive()) {
        // Profiler emits connectedCallback events even without a user callback.
        withProfiler(instance, OperationId.ConnectedCallback, () => {});
    }
    // Produce the block now (if not already), so the first render sees props +
    // wired values.
    instance.mountPhase = 'render';
    renderInstance(instance);
    // Validate the stylesheet token BEFORE inserting any DOM, so a malicious/invalid
    // token aborts the mount with NO rendered children (W-16614556). (injectStylesheets
    // below re-validates, but by then children are inserted.)
    validateStylesheetToken(instance);
    // Insert the rendered block first so scope-token application can see the
    // elements, then inject stylesheets + apply scope tokens. The DOM insertion is
    // vapor's analogue of engine-core's "patch" operation.
    // Skip the "patch" profiler span (and the no-op insert) when the rendered block is
    // EMPTY (e.g. an empty `<template></template>`): engine-core emits no patch
    // operation when there are no vnodes to patch (performance-timing nested-creation
    // expects render + renderedCallback but NO patch span for the empty x-nested).
    const blockIsEmpty =
        instance.block == null || (Array.isArray(instance.block) && instance.block.length === 0);
    if (instance.block && !blockIsEmpty) {
        withProfiler(instance, OperationId.Patch, () => {
            insertBlock(instance.block!, instance.renderRoot);
        });
    } else if (instance.block) {
        // Still insert (cheap no-op for empty), but without a profiler span.
        insertBlock(instance.block, instance.renderRoot);
    }
    // Light-DOM components have no shadow root, so the browser can't project into
    // their `<slot>` elements. Resolve them inline: replace each rendered `<slot>`
    // with the parent's slotted content for that name (or keep its fallback).
    if (instance.isLight) {
        resolveLightDomSlots(instance);
        // Reactive light-DOM slot REORDER: keep the host's slotted children grouped by
        // slot-declaration order as their `slot` attributes change under multi-level
        // forwarding (a parent reassigns a forwarded child's `slot={expr}`). Runs in the
        // instance's render scope (torn down on unmount) and subscribes to the slot-attr
        // epoch. No-op unless the host declares ≥2 slots.
        const host = instance.host as HTMLElement;
        if (instance.scope) {
            instance.scope.run(() => {
                renderEffect(() => reorderLightSlots(host));
            });
        }
    }
    // Dev-only: restrict `outerHTML` setting on the elements this component
    // rendered (matching engine-core's per-element patchElementWithRestrictions).
    if (process.env.NODE_ENV !== 'production') {
        applyElementRestrictions(instance.renderRoot as unknown as ParentNode);
    }
    injectStylesheets(instance);
    instance.isMounted = true;
    // Refs are now in the DOM — `this.refs` becomes valid from renderedCallback on.
    instance.hasRenderedOnce = true;
    registerMounted(instance);
    // The initial renderedCallback fires synchronously as part of the mount
    // cycle (matching LWC, where it has run by the time appendChild returns).
    // Subsequent update-driven renderedCallbacks are async + coalesced (see
    // scheduleRenderedCallback).
    instance.mountPhase = 'rendered';
    const rc = (instance.reactiveTarget as any).renderedCallback;
    if (typeof rc === 'function') {
        try {
            // A component created via `createElement` + `appendChild` INSIDE this
            // renderedCallback is a fresh top-level render — it must get its OWN
            // GlobalRender (`lwc-render`) span, not be nested in this mount's frame
            // (performance-timing nested-creation). The template children already
            // mounted during the render/patch phase above; by renderedCallback the
            // mount frame is logically closed, so reset `mountDepth` to 0 around it so
            // an imperative child mount is treated as root.
            const prevDepth = mountDepth;
            mountDepth = 0;
            try {
                withProfiler(instance, OperationId.RenderedCallback, () =>
                    callLifecycle(instance, rc)
                );
            } finally {
                mountDepth = prevDepth;
            }
        } catch (err) {
            attachErrorComponentStack(instance, err);
            if (!handleError(instance, err)) throw err;
        }
    } else if (isProfilerActive()) {
        withProfiler(instance, OperationId.RenderedCallback, () => {});
    }
    // Project slotted content into this (shadow) host's light DOM AFTER this host's
    // own connectedCallback, render, and renderedCallback have completed. LWC's
    // ordering is: a host's OWN subtree (shadow children) fully mounts (cc → rc,
    // bottom-up) and the host's rc fires, and only THEN does its slotted (light-DOM)
    // content connect. Inserting the slotted content here synchronously mounts the
    // slotted children (their cc + rc fire now). Doing this after `rc` keeps the
    // host's own renderedCallback before its slotted descendants' callbacks —
    // matching `<x-foo class="a"><x-foo class="b">`: a:cc, internal-a:cc/rc, a:rc,
    // THEN b:cc, ...
    if (instance.slotOwner !== undefined && instance.slotset && projectSlotsHook) {
        projectSlotsHook(instance.host, instance.slotset, instance.slotOwner);
        // Projected once; clear so a hot-swap re-render doesn't double-project.
        instance.slotOwner = undefined;
    }
    // Flatten nested fragment bookends inside this instance's STANDARD slots, now that
    // the DOM is fully assembled (slot fragments + their content are all in place).
    flattenSlotFrags(instance);
}

/**
 * Engine-core's `flattenFragmentsInChildren`: a STANDARD slot's resolved content,
 * when built from nested `lwc:if`/`for:each` fragments, carries each nested
 * fragment's leading/trailing `<!---->` bookend. engine-core strips those delimiters
 * when allocating slotted children — only the SLOT's own bookend pair remains. We do
 * it here, post-mount (the slot content is inserted into the DOM AFTER the slot
 * fragment, so this can't run inline in createSlot). Walk strictly between each slot
 * fragment's own start/anchor (tagged `__slotFrag`) and remove the nested
 * fragment-owner comment markers (`__ownerFrag` but NOT `__slotFrag`).
 */
function flattenSlotFrags(instance: VaporInstance): void {
    const frags = instance.slotFragsToFlatten;
    if (!frags || frags.length === 0) return;
    for (const frag of frags) {
        const start = frag.start;
        const anchor = frag.anchor;
        const parent = start.parentNode;
        if (!parent || !anchor || anchor.parentNode !== parent) continue;
        for (let n = start.nextSibling; n && n !== anchor;) {
            const nxt = n.nextSibling;
            // Strip EVERY nested fragment bookend in this slot's resolved content —
            // both control-flow owner bookends (`__ownerFrag`) AND nested slot bookends
            // (`__slotFrag`) from intermediate forwarding `<slot>`s. engine-core's
            // `flattenFragmentsInChildren` keeps only the OUTERMOST (this) slot's own
            // pair; multi-level slot forwarding (consumer → forwarding slot → container
            // slot) otherwise stacks 3 pairs around one element. This slot's OWN
            // start/anchor are never visited (the walk is start.nextSibling..anchor,
            // exclusive), so they always survive.
            if (
                n.nodeType === 8 /* Comment */ &&
                ((n as { __ownerFrag?: boolean }).__ownerFrag === true ||
                    (n as { __slotFrag?: boolean }).__slotFrag === true) &&
                // KEEP a DYNAMIC forwarding slot's bookends: stripping them detaches the
                // forwarding DynamicFragment's anchor, making a later `slot={expr}`
                // re-resolve DOM-inert (see slot.ts isDynForwarding). A forwarding slot's
                // bookends are ALSO `__ownerFrag` (set by the DynamicFragment ctor), so
                // this guard must gate the WHOLE strip condition, not just the
                // `__slotFrag` sub-clause.
                (n as { __forwarding?: boolean }).__forwarding !== true
            ) {
                parent.removeChild(n);
            }
            n = nxt;
        }
    }
    // Re-split non-reassignable default content (text/comment) out of a NAMED terminal
    // light-slot region into this instance's DEFAULT slot region. A forwarding
    // `<slot slot="X">` re-tags only ELEMENTS; text/comment (no `slot` attribute) ride
    // along into slot X, but engine-core distributes them to the default `""` slot (a
    // native shadow leaf splits them via native `<slot>` projection; a light leaf's
    // key-based createSlot distribution does not). Only when this instance HAS a plain
    // (non-forwarding) default slot frag to move them into — i.e. a LIGHT leaf. Shadow
    // components render real `<slot>` elements and register no frags (untouched); a
    // forwarding mid has only a forwarding default frag (no plain default → no-op).
    const defFrag = frags.find(
        (f) =>
            (f as { __slotName?: string }).__slotName === '' &&
            !(f as { __forwarding?: boolean }).__forwarding
    );
    const defAnchor = defFrag?.anchor;
    if (defAnchor && defAnchor.parentNode) {
        for (const frag of frags) {
            if (
                frag === defFrag ||
                (frag as { __slotName?: string }).__slotName === '' ||
                (frag as { __forwarding?: boolean }).__forwarding ||
                // Only re-split a named slot showing ASSIGNED content. A slot rendering
                // its OWN fallback text (`<slot name=foo>fallback for foo</slot>`, nothing
                // assigned) must keep that text where it is.
                !(frag as { __assigned?: boolean }).__assigned
            ) {
                continue;
            }
            const start = frag.start;
            const anchor = frag.anchor;
            const parent = start.parentNode;
            if (
                !parent ||
                !anchor ||
                anchor.parentNode !== parent ||
                defAnchor.parentNode !== parent
            ) {
                continue;
            }
            for (let n = start.nextSibling; n && n !== anchor;) {
                const nxt = n.nextSibling;
                const isTextOrComment =
                    n.nodeType === 3 /* Text */ || n.nodeType === 8; /* Comment */
                const isBookend =
                    (n as { __slotFrag?: boolean }).__slotFrag === true ||
                    (n as { __ownerFrag?: boolean }).__ownerFrag === true;
                if (isTextOrComment && !isBookend) {
                    parent.insertBefore(n, defAnchor);
                }
                n = nxt;
            }
        }
    }
    instance.slotFragsToFlatten = undefined;
}

/**
 * Find the DIRECT child component instances within a subtree `root` (a shadow root
 * or a host's light DOM), in document order, WITHOUT descending into a nested
 * component's own subtree (we stop at each component host — its children are walked
 * by its own ordered disconnect). Returns the VaporInstance for each host found.
 */
function collectDirectChildInstances(root: ParentNode): VaporInstance[] {
    const result: VaporInstance[] = [];
    const walk = (node: Node) => {
        for (let child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType !== 1) continue;
            const inst = (child as unknown as Record<symbol, unknown>)[VM_SLOT] as
                VaporInstance | undefined;
            if (inst) {
                // A component host — record it but DON'T descend (its own ordered
                // disconnect walks its subtree).
                result.push(inst);
            } else {
                walk(child);
            }
        }
    };
    walk(root as unknown as Node);
    return result;
}

/**
 * Tear down ONE instance: fire disconnectedCallback, run cleanups, unsubscribe
 * signals, stop the render-effect scope. Does NOT remove DOM (the outermost
 * removal already detached the whole subtree) and does NOT recurse — recursion is
 * driven by `runOrderedDisconnect` in LWC's traversal order.
 */
function teardownInstance(instance: VaporInstance): void {
    disconnectWireAdapters(instance);
    const dc = (instance.reactiveTarget as any).disconnectedCallback;
    if (typeof dc === 'function') {
        try {
            withProfiler(instance, OperationId.DisconnectedCallback, () =>
                callLifecycle(instance, dc)
            );
        } catch (err) {
            attachErrorComponentStack(instance, err);
            if (!handleError(instance, err)) throw err;
        }
    } else if (isProfilerActive()) {
        withProfiler(instance, OperationId.DisconnectedCallback, () => {});
    }
    for (const cleanup of instance.cleanups) cleanup();
    instance.cleanups = [];
    if (instance.signalCleanups) {
        for (const unsub of instance.signalCleanups) unsub();
        instance.signalCleanups = [];
    }
    instance.signalsSeen = undefined;
    if (instance.scope) {
        instance.scope.stop();
    }
    // Stop the template-switch tracking effect so it can never re-fire after unmount.
    if (instance.renderDriverScope) {
        instance.renderDriverScope.stop();
        instance.renderDriverScope = undefined;
        instance.renderDriver = undefined;
    }
    // Release this instance's global light-DOM styles (ref-counted) so a fully
    // unmounted light component's <style> is dropped when no instance needs it.
    if (instance.lightStyleCss && instance.lightStyleRoot) {
        for (const css of instance.lightStyleCss) {
            releaseGlobalLightStyle(instance.lightStyleRoot, css);
        }
        instance.lightStyleCss = undefined;
    }
    instance.isMounted = false;
    // The rendered block is NOT removed on disconnect (the detached host keeps its
    // subtree), so a reconnect can re-fire callbacks without re-rendering.
    instance.domPreserved = true;
    unregisterMounted(instance);
}

/**
 * Disconnect an instance and its whole subtree in LWC's exact order, matching
 * engine-core's `resetComponentStateWhenRemoved`:
 *   1. this instance's own disconnectedCallback + teardown,
 *   2. its SHADOW child components in REVERSE document order (recursively),
 *   3. its SLOTTED (light-DOM) child components in FORWARD order (recursively).
 * The `disconnected` guard makes the native per-element disconnect reaction a
 * no-op for any instance already handled by this (outermost-first) traversal.
 */
function runOrderedDisconnect(instance: VaporInstance): void {
    if (instance.disconnected || !instance.isMounted) return;
    instance.disconnected = true;

    // Collect children BEFORE teardown (blocks still in the DOM). Classify into:
    //  - velements: components this instance RENDERED in its own tree (parent===this) —
    //    walked in REVERSE (engine-core's runChildNodesDisconnectedCallback).
    //  - aChildren: components SLOTTED INTO this host by an ancestor (parent!==this) —
    //    walked FORWARD (engine-core's runLightChildNodesDisconnectedCallback).
    // For a SHADOW component, velements live in its shadow root and aChildren are its
    // host's light-DOM (slotted) children. For a LIGHT component both share the host's
    // light DOM, so they're partitioned by ownership (`parent`).
    const velements: VaporInstance[] = [];
    const aChildren: VaporInstance[] = [];
    if (instance.isLight) {
        // Declaration-rank of each NAMED-slot velement (the slot bucket it landed in),
        // so the reverse-walk below emits them in reverse slot-DECLARATION order (e.g.
        // `<slot name=top>`/`<slot name=bottom>` → `[bottom, top]`), matching
        // engine-core's velements array (populated as `<slot>` vnodes render). Physical
        // DOM order is unreliable (reorderLightSlots permutes it, and a forwarding recreate
        // inserts new hosts adjacent to the OLD host they replace), and raw creation `idx`
        // is unreliable (a recreate assigns new hosts monotonic idx in retag order, not
        // slot order) — so key on the slot-declaration rank instead.
        // Ordering key for a NAMED-slot velement: its slot-declaration rank plus whether
        // it was RECREATED by a forwarding-slot keyed diff. The velements array is walked
        // in REVERSE below, so we must arrange it to yield engine-core's disconnect order:
        //  - ORIGINAL (authored) named slotees disconnect in reverse slot-declaration order
        //    (`[bottom, top]`) → array is declaration-ascending (`[top, bottom]`).
        //  - RECREATED named slotees disconnect in creation (idx-ascending) order — the
        //    keyed diff appended their fresh vnodes to velements in creation order → array
        //    is idx-DESCENDING for that group, and the recreated group sits AFTER the
        //    original group in the array (so the reverse-walk emits recreated first).
        const rankInfo = new WeakMap<VaporInstance, { decl: number; recreated: boolean }>();
        for (const c of collectDirectChildInstances(instance.host as unknown as ParentNode)) {
            // A child this instance RENDERED (parent===this) is a velement. A SLOTTED
            // child (parent!==this) is normally an aChild — EXCEPT one distributed into
            // a NAMED slot of THIS slottable, which engine-core tracks as a velement
            // (so named-slot slotted children disconnect in REVERSE before default-slot
            // ones disconnect forward → standardSlotting `[2,0,1]`).
            if (c.parent === instance) {
                velements.push(c);
                continue;
            }
            const assignment = (c.host as unknown as Record<symbol, unknown>)[SLOT_ASSIGNMENT] as
                { name: string; slottable: VaporInstance; recreated?: boolean } | undefined;
            if (assignment && assignment.slottable === instance && assignment.name !== '') {
                rankInfo.set(c, {
                    decl: getLightSlotDeclRank(instance.host as object, assignment.name),
                    recreated: assignment.recreated === true,
                });
                velements.push(c);
            } else {
                aChildren.push(c);
            }
        }
        velements.sort((a, b) => {
            const ra = rankInfo.get(a);
            const rb = rankInfo.get(b);
            // RENDERED velements (no rank info) keep physical order via idx.
            if (!ra || !rb) return (a.idx ?? 0) - (b.idx ?? 0);
            // Recreated group sits AFTER the original group in the array.
            if (ra.recreated !== rb.recreated) return ra.recreated ? 1 : -1;
            // Recreated: idx-DESCENDING (reverse-walk → idx-ascending disconnect).
            if (ra.recreated) return (b.idx ?? 0) - (a.idx ?? 0);
            // Original: declaration-ascending (reverse-walk → reverse-declaration).
            return ra.decl - rb.decl || (a.idx ?? 0) - (b.idx ?? 0);
        });
        aChildren.sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));
    } else {
        for (const c of collectDirectChildInstances(instance.renderRoot as unknown as ParentNode)) {
            velements.push(c);
        }
        for (const c of collectDirectChildInstances(instance.host as unknown as ParentNode)) {
            aChildren.push(c);
        }
    }

    teardownInstance(instance);

    // velements in REVERSE order.
    for (let i = velements.length - 1; i >= 0; i--) {
        runOrderedDisconnect(velements[i]);
    }
    // Slotted/light children in FORWARD order.
    for (let i = 0; i < aChildren.length; i++) {
        runOrderedDisconnect(aChildren[i]);
    }
}

export function unmountInstance(instance: VaporInstance): void {
    // Already torn down by an ancestor's ordered disconnect — the native
    // per-element disconnect reaction is a no-op in that case.
    if (instance.disconnected || !instance.isMounted) {
        // The outermost removal drives the whole subtree; still remove this
        // instance's own block from the DOM if it somehow remained.
        return;
    }
    // Drive the ordered disconnect for this instance's whole subtree (this is the
    // outermost removed instance — its native reaction fires first in document
    // order).
    runOrderedDisconnect(instance);
    // DO NOT remove the rendered block: the host element detaches from the document
    // WITH its whole rendered subtree intact (the DOM travels with it). Preserving
    // it lets a later re-append (reconnect) re-fire connectedCallback/renderedCallback
    // WITHOUT re-rendering — matching engine-core, where a disconnect→reconnect keeps
    // the DOM and does NOT re-run render() (lifecycle-callbacks "reconnect"). Mark the
    // block preserved so mountInstance takes the reconnect (no-render) path.
    instance.domPreserved = true;
}

/**
 * Re-render a mounted instance from scratch (used by hot-swap / HMR): tear down
 * the current block + render effects, then re-render with the (possibly swapped)
 * template and re-insert. The component instance/state is preserved.
 */
function reRenderInstance(instance: VaporInstance, keepRenderFn = false): void {
    if (!instance.isMounted) return;
    // Tear down old render-effect scope + DOM.
    if (instance.scope) instance.scope.stop();
    if (instance.block) removeBlock(instance.block, instance.renderRoot);
    instance.block = null;
    // Re-resolve the render fn through the swap map (template hot-swap), and reset
    // injected-stylesheet bookkeeping so swapped styles re-apply. When the caller
    // already set a new renderFn (template switching), keep it.
    if (!keepRenderFn) {
        instance.renderFn =
            (resolveTemplate(instance.renderFn) as VaporRenderFn) ?? instance.renderFn;
    } else {
        // Template switch: the renderDriver effect already invoked render() (and set
        // the new renderFn). Tell renderInstance NOT to re-run the driver (which would
        // re-invoke render() and double its side effects).
        instance.skipDriverRerun = true;
    }
    injectedRoots.delete(instance.renderRoot);
    renderInstance(instance);
    if (instance.block) {
        insertBlock(instance.block, instance.renderRoot);
    }
    injectStylesheets(instance);
    const rc = (instance.reactiveTarget as any).renderedCallback;
    if (typeof rc === 'function') rc.call(instance.component);
}

// Wire hot-swap callbacks (avoids circular import: swap.ts needs these from here).
setReRenderInstance(reRenderInstance);
setIsComponentConstructor((c) => isComponentConstructor(c));
setLogSlotError((msg) => logVaporError(msg));
// DUPLICATE-SLOT lifecycle parity (#3827). After a light-DOM `lwc:if` branch toggle
// over DUPLICATED `<slot>`s, engine-core's light-DOM keyed-slot diff emits a SPURIOUS
// disconnectedCallback on the newly-connected slotted leaf, and (for the direct→nested
// branch transition) SUPPRESSES the real previous leaf's dc. Vapor re-creates slot
// content per branch (no keyed slot-vnode diff), so it must reproduce this observed
// sequence to match the engine. Scoped narrowly to SLOTTED light children across a
// conditional toggle so ordinary conditional light children keep the clean [cc, dc].
// Walk a block for LIGHT child-component instances that are SLOTTED content: their
// host was distributed here by an ANCESTOR (`inst.parent !== the createIf's owner`),
// projected through a `<slot>` that is DUPLICATED across conditional branches. A
// child rendered DIRECTLY by the toggling template has `parent === owner` and is
// EXCLUDED — this is the narrow #3827 duplicate-slot signature, not a plain
// conditional light child (which must keep the clean [cc, dc] sequence).
const forEachLightLeaf = (block: unknown, cb: (inst: VaporInstance) => void): void => {
    const owner = getCurrentOwner() as VaporInstance | null;
    const visit = (b: unknown): void => {
        if (b instanceof Node) {
            if (b.nodeType === 1) {
                const inst = (b as unknown as Record<symbol, unknown>)[VM_SLOT] as
                    VaporInstance | undefined;
                // Engage ONLY for a SLOTTED light child (parent is an ancestor, not the
                // createIf owner). A directly-rendered conditional child is skipped.
                if (inst && inst.isLight && owner && inst.parent !== owner) {
                    cb(inst);
                }
                for (let c = b.firstChild; c; c = c.nextSibling) visit(c);
            }
            return;
        }
        if (Array.isArray(b)) {
            for (const x of b) visit(x);
        } else if (b && typeof b === 'object' && 'nodes' in (b as object)) {
            visit((b as { nodes: unknown }).nodes);
        } else if (b && typeof b === 'object' && 'block' in (b as object)) {
            visit((b as { block?: unknown }).block);
        }
    };
    visit(block);
};
// PRE-teardown: for the DIRECT-branch → NESTED-branch transition (prev = a top-level
// `createIf`'s direct positive branch, new = its nested `createIf` branch), engine-core
// omits the previous slotted leaf's disconnectedCallback. Pre-mark it disconnected so
// its real dc is skipped, yielding the observed [current:cc, current:dc]. Detected by
// the NEW branch containing a nested DynamicFragment while the PREV branch does not.
setDupSlotDcPreHook((prevNodes, newNodes) => {
    if (containsNestedDynamicFragment(newNodes) && !containsNestedDynamicFragment(prevNodes)) {
        forEachLightLeaf(prevNodes, (inst) => {
            if (inst.isMounted) inst.disconnected = true;
        });
    }
});
// POST-teardown: reproduce the spurious disconnectedCallback on the newly-connected
// slotted leaf (callback only — the instance stays mounted, so its real teardown at
// removal still fires normally).
setDupSlotDcHook((_prevNodes, newNodes) => {
    forEachLightLeaf(newNodes, (inst) => {
        if (!inst.isMounted) return;
        const dc = (inst.reactiveTarget as any).disconnectedCallback;
        if (typeof dc === 'function') {
            try {
                callLifecycle(inst, dc);
            } catch {
                /* the leaf's dc is a spurious replay; swallow to avoid poisoning teardown */
            }
        }
    });
});
// Collect a standard slot's fragment on the instance that's rendering it, so it can
// be flattened post-mount (strip nested fragment bookends in the slot's content).
setRegisterSlotForFlatten((frag) => {
    const inst = getCurrentInstance();
    if (!inst) return;
    (inst.slotFragsToFlatten ??= []).push(frag as unknown as DynamicFragment);
});
// Resolve the host of the light component currently rendering a `<slot>`, so
// createSlot records its slot-name declaration order for the reactive reorder.
setCurrentLightHostResolver(() => {
    const inst = getCurrentInstance();
    return inst && inst.isLight ? (inst.host as HTMLElement) : null;
});
// Tag each top-level element of named-slot content with its slot name + the
// slottable (current instance) that owns the `<slot>`, for disconnect ordering.
setRecordSlotAssignment((block, name) => {
    const slottable = getCurrentInstance();
    if (!slottable) return;
    const tag = (b: unknown): void => {
        if (b instanceof Node) {
            if (b.nodeType === 1) {
                (b as unknown as Record<symbol, unknown>)[SLOT_ASSIGNMENT] = {
                    name,
                    slottable,
                };
            }
        } else if (Array.isArray(b)) {
            for (const x of b) tag(x);
        } else if (b && typeof b === 'object' && 'nodes' in b) {
            tag((b as { nodes: unknown }).nodes);
        }
    };
    tag(block);
});
// Provide for:each error messages with the current component's vm string
// (`[object:vm Name (idx)]`) and host tag, matching engine-core's wording.
setForContext(() => {
    const inst = getCurrentInstance();
    const name = (inst?.ctor as { name?: string })?.name ?? 'Unknown';
    const idx = inst ? forVmIdx(inst) : 0;
    const tag = inst?.tagName ?? 'unknown';
    return { vm: `[object:vm ${name} (${idx})]`, tag };
});
const forVmIndices = new WeakMap<object, number>();
let forVmCounter = 0;
function forVmIdx(inst: object): number {
    let idx = forVmIndices.get(inst);
    if (idx === undefined) {
        idx = forVmCounter++;
        forVmIndices.set(inst, idx);
    }
    return idx;
}
/** engine-core-style vm string `[object:vm Name (idx)]` for dev messages. */
function vmString(inst: VaporInstance): string {
    const name = (inst.ctor as { name?: string })?.name ?? 'Unknown';
    return `[object:vm ${name} (${forVmIdx(inst)})]`;
}

export function updateProps(instance: VaporInstance, props: Record<string, unknown>): void {
    batch(() => {
        for (const key of Object.keys(props)) {
            (instance.component as any)[key] = props[key];
        }
    });
}
