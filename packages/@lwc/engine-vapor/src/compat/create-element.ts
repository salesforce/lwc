/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { AriaPropNameToAttrNameMap } from '@lwc/shared';
import {
    renderEffect,
    getCurrentOwner,
    setCurrentOwner,
    getCurrentCoOwner,
    setCurrentCoOwner,
    isFlushingAsync,
    captureFlushError,
    untrack,
} from '../renderEffect';
import { type Block, DynamicFragment, insertBlock } from '../block';
import { getActiveScope, type EffectScope } from '../scope';
import { setProp, setClass, setStyle } from '../dom/prop';
import { getReadOnlyProxy } from '../reactivity';
import { setRecreateForwardedSlotee } from '../slot';
import { resolveCtor } from './swap';
import { getCurrentInstance, setCurrentInstance, setInstanceRef } from './instance';
import { setActCreateChildComponent } from './act-compat';
import { getLockerHooks, getFeatureFlagValue, report, isReportingEnabled } from './reporting';
import {
    createComponentInstance,
    mountInstance,
    mountForHydrate,
    unmountInstance,
    setCustomElementConstructorBuilder,
    setProjectSlotsHook,
    isComponentConstructor,
    handleErrorSelfOrAncestor,
    getComponentDef,
    VM_SLOT,
    REFLECTIVE_GLOBAL_PROP_NAMES,
    withSuppressedSideEffectCheck,
    transferSlotAssignment,
    type VaporInstance,
} from './lightning-element';

const ariaPropNames = AriaPropNameToAttrNameMap;

// Register the CustomElementConstructor builder so `Ctor.CustomElementConstructor`
// (defined lazily in registerComponent) can build a self-upgrading element class.
setCustomElementConstructorBuilder(buildCustomElementConstructor);

interface CreateElementOptions {
    is: any;
    mode?: 'open' | 'closed';
}

const definedTags = new Map<string, any>();
// Tracks each defined tag's `formAssociated` value, to reject re-registering the
// same tag with a conflicting value (a custom element's formAssociated is fixed).
const formAssociatedByTag = new Map<string, boolean>();

// Marks a host element whose component instance construction is deferred to
// connect time (child components — see createDeferredChild). The custom element's
// connectedCallback invokes this before mounting.
const DEFERRED_UPGRADE = Symbol('vapor-deferred-upgrade');
// The owner (parent instance) captured at parent-render time, used to route a
// constructor throw during the deferred upgrade to the parent's errorCallback.
const DEFERRED_OWNER = Symbol('vapor-deferred-owner');
// The CO-OWNER (the slot-host child) captured at creation for a child component
// created inside a slot body — so its prop-forwarding effects also schedule the
// slot host's renderedCallback (scoped-slot rehydration: child:renderedCallback).
const DEFERRED_CO_OWNER = Symbol('vapor-deferred-co-owner');
// A FALLBACK error-routing owner, captured ONLY for a child created during a
// SYNCHRONOUS reconcile (not during the async flush) when no DEFERRED_OWNER could
// be captured (getCurrentInstance() is null inside a ReactiveEffect.run(), which
// restores only currentOwner). Used solely by the connectedCallback catch to route
// a mount/render/renderedCallback throw to the enclosing error boundary — the same
// destination engine-core reaches via getErrorBoundaryVM(owner). It never changes
// instance.parent or the deferred-reconcile timing, and is intentionally NOT
// captured during flushAsyncQueue (see isFlushingAsync), so the post-mount async
// reconcile path — including the errorCallback-throws-after-value-mutation cluster —
// is byte-for-byte unchanged.
const DEFERRED_ERROR_OWNER = Symbol('vapor-deferred-error-owner');
// Recreate factory stashed on a light-DOM child-component host so that, when its
// `slot=` binding reactively RETARGETS (engine-core's keyed light-DOM slot diff
// UNMOUNTS the old slotee and MOUNTS a fresh one when it changes slot bucket), the
// runtime can tear the current instance down and build a brand-new host+instance in
// place — reproducing the recreate lifecycle ([newCc, oldDc]) that engine-core fires
// on a forwarded-slot reassignment. Only light child components carry it (a plain
// element or a shadow child repositions/re-projects in place, no recreate).
const RECREATE_SLOTEE = Symbol('vapor-recreate-slotee');

type DeferredHost = HTMLElement & {
    [VM_SLOT]?: VaporInstance;
    [DEFERRED_UPGRADE]?: () => void;
    [DEFERRED_OWNER]?: VaporInstance;
    [DEFERRED_CO_OWNER]?: VaporInstance;
    [DEFERRED_ERROR_OWNER]?: VaporInstance;
};

// --- Synthetic custom-element lifecycle -------------------------------------
// Vapor normally drives connect/disconnect via the browser's NATIVE custom-element
// reactions (see ensureCustomElementDefined). When the runtime flag
// `DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE` is set (possibly LAZILY, at test time,
// after the bundle initialized) a component must instead connect SYNTHETICALLY: it
// mounts when appended to ANY parent — even a detached one — mirroring engine-dom's
// `create-element.ts`. We record per-element connect/disconnect callbacks in
// WeakMaps and monkey-patch the Node insertion/removal APIs (once) to invoke them.
// Elements flagged synthetic skip the native reaction path (SYNTHETIC_LIFECYCLE),
// so an element connected to the real document is not mounted twice.
const SYNTHETIC_LIFECYCLE = Symbol('vapor-synthetic-lifecycle');
type NodeSlotCallback = (element: Node) => void;
const ConnectingSlot = new WeakMap<Node, NodeSlotCallback>();
const DisconnectingSlot = new WeakMap<Node, NodeSlotCallback>();

function callNodeSlot(node: Node, slot: WeakMap<Node, NodeSlotCallback>): Node {
    const fn = slot.get(node);
    if (fn !== undefined) {
        fn(node);
    }
    return node;
}

let monkeyPatched = false;
function monkeyPatchDomAPIs(): void {
    if (monkeyPatched) return;
    monkeyPatched = true;
    const proto = Node.prototype;
    const { appendChild, insertBefore, removeChild, replaceChild } = proto;
    Object.assign(proto, {
        appendChild(this: Node, newChild: Node) {
            const appended = appendChild.call(this, newChild);
            return callNodeSlot(appended, ConnectingSlot);
        },
        insertBefore(this: Node, newChild: Node, referenceNode: Node | null) {
            if (process.env.NODE_ENV !== 'production' && arguments.length < 2) {
                // eslint-disable-next-line no-console
                console.warn(
                    'insertBefore should be called with 2 arguments. Calling with only 1 argument is not supported.'
                );
            }
            const inserted = insertBefore.call(this, newChild, referenceNode ?? null);
            return callNodeSlot(inserted, ConnectingSlot);
        },
        removeChild(this: Node, oldChild: Node) {
            const removed = removeChild.call(this, oldChild);
            return callNodeSlot(removed, DisconnectingSlot);
        },
        replaceChild(this: Node, newChild: Node, oldChild: Node) {
            const replaced = replaceChild.call(this, newChild, oldChild);
            callNodeSlot(replaced, DisconnectingSlot);
            callNodeSlot(newChild, ConnectingSlot);
            return replaced;
        },
    } as Pick<Node, 'appendChild' | 'insertBefore' | 'removeChild' | 'replaceChild'>);
}

// Synthetic connect: mount the instance (fires connectedCallback + render), then
// replicate engine-core's `runConnectedCallback` disconnected-DOM check — a dev
// warning (once) plus a `ConnectingCallbackWhileDisconnected` reporting event when
// the host is not actually connected to the document. Gated on the synthetic flag
// so the NATIVE path is entirely untouched.
const connectedWhileDisconnectedWarned = new Set<string>();
function syntheticConnect(node: Node): void {
    const host = node as DeferredHost;
    const deferred = host[DEFERRED_UPGRADE];
    if (deferred) deferred();
    const instance = host[VM_SLOT];
    if (!instance) return;
    mountInstance(instance);
    if (!(host as HTMLElement).isConnected) {
        const tagName = instance.tagName ?? (host as HTMLElement).tagName.toLowerCase();
        if (
            process.env.NODE_ENV !== 'production' &&
            !connectedWhileDisconnectedWarned.has(tagName)
        ) {
            connectedWhileDisconnectedWarned.add(tagName);
            try {
                throw new Error(
                    `[LWC warn]: Element <${tagName}> fired a \`connectedCallback\` and rendered, ` +
                        `but was not connected to the DOM. Please ensure all components are actually ` +
                        `connected to the DOM, e.g. using \`document.body.appendChild(element)\`. This ` +
                        `will not be supported in future versions of LWC and could cause component ` +
                        `errors. For details, see: https://sfdc.co/synthetic-lifecycle`
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(e);
            }
        }
        if (process.env.NODE_ENV !== 'production' || isReportingEnabled()) {
            report('ConnectedCallbackWhileDisconnected', { tagName });
        }
    }
}
function syntheticDisconnect(node: Node): void {
    const instance = (node as DeferredHost)[VM_SLOT];
    if (instance) unmountInstance(instance);
}
if (typeof globalThis !== 'undefined') {
    // The WTR harness clears deduped dev warnings between tests via
    // `__lwcResetAlreadyLoggedMessages()`. Chain our per-tag set onto that same
    // hook so the "connectedCallback while disconnected" warning re-fires each test.
    const g = globalThis as { __lwcResetAlreadyLoggedMessages?: () => void };
    const prevReset = g.__lwcResetAlreadyLoggedMessages;
    g.__lwcResetAlreadyLoggedMessages = () => {
        prevReset?.();
        connectedWhileDisconnectedWarned.clear();
    };
}

/**
 * Defines (once per tag) the custom element class that bridges native lifecycle
 * to the vapor instance. On connect it first runs any deferred upgrade (child
 * components construct here, so lifecycle order matches LWC), then mounts.
 */
function ensureCustomElementDefined(tagName: string, Ctor: any): void {
    const formAssociated = (Ctor as { formAssociated?: boolean }).formAssociated === true;
    if (definedTags.get(tagName) || customElements.get(tagName)) {
        // A custom element's `formAssociated` is fixed at registration. Re-registering
        // the SAME tag with a different `formAssociated` value is invalid (the native
        // CustomElementRegistry would reject the redefine) — throw engine-dom's exact
        // error (LightningElement.attachInternals "different formAssociated value").
        const prev = formAssociatedByTag.get(tagName);
        if (prev !== undefined && prev !== formAssociated) {
            throw new Error(
                `<${tagName}> was already registered with formAssociated=${prev}. It cannot be ` +
                    `re-registered with formAssociated=${formAssociated}. Please rename your ` +
                    `component to have a different name than <${tagName}>.`
            );
        }
        return;
    }
    formAssociatedByTag.set(tagName, formAssociated);
    const ElementClass = class extends HTMLElement {
        [VM_SLOT]?: VaporInstance;
        [DEFERRED_UPGRADE]?: () => void;
        static formAssociated = formAssociated;
        connectedCallback() {
            // SYNTHETIC lifecycle: this element mounts via the monkey-patched
            // appendChild/insertBefore (ConnectingSlot), NOT the native reaction —
            // skip so it is not connected twice if it later joins the real document.
            if ((this as any)[SYNTHETIC_LIFECYCLE]) return;
            // Construction (deferred) + mount happen here, inside the browser's
            // custom-element reaction — which SWALLOWS throws (reporting to
            // window.onerror) instead of propagating to the parent code that
            // inserted this host. So a child error would never reach the parent's
            // errorCallback boundary on its own. mountInstance already routes
            // mount-phase errors to the boundary (it walks instance.parent, which is
            // now correct thanks to the owner-restore in doUpgrade). The remaining
            // gap is a CONSTRUCTOR throw: it escapes doUpgrade before any instance
            // exists, so route it to the captured owner (the parent boundary).
            //
            // SIBLING-ABORT (see the catch below): a PRECEDING sibling in the same block
            // whose constructor/render threw marked our shared render owner. Skip our own
            // upgrade/mount and remove ourself so we never enter the DOM — engine-core
            // never builds the vnodes that follow a construction/render throw.
            const abortHost =
                (this as DeferredHost)[DEFERRED_OWNER] ??
                (this as DeferredHost)[DEFERRED_ERROR_OWNER] ??
                // FLUSH-TIME fallback (see the matching resolution in the catch's
                // SET-ABORT and the owner resolution below). During flushAsyncQueue
                // the enclosing createIf reconcile ran via ReactiveEffect.run(), which
                // restored `currentOwner` (the parent boundary) but NOT currentInstance,
                // so createDeferredChild captured no DEFERRED_OWNER. The throwing sibling
                // marked that live render owner; read it here so this following sibling
                // honors the abort.
                (isFlushingAsync()
                    ? ((getCurrentOwner() as VaporInstance | null) ?? undefined)
                    : undefined);
            if (abortHost && (abortHost as VaporInstance).abortDeferredChildMount === true) {
                (this as ChildNode).remove();
                return;
            }
            try {
                const deferred = (this as DeferredHost)[DEFERRED_UPGRADE];
                if (deferred) deferred();
                const instance = this[VM_SLOT];
                if (instance) mountInstance(instance);
            } catch (err) {
                // ENGINE-CORE SIBLING-ABORT PARITY (errorCallback value-mutation cluster).
                // A CONSTRUCTOR or RENDER throw aborts the rest of the enclosing template:
                // engine-core builds the vnode tree top-down, so a child that throws while
                // constructing/rendering never produces the sibling vnodes that FOLLOW it,
                // and those elements never enter the DOM. Vapor eagerly builds every sibling
                // element during the block's synchronous build (each child's construction is
                // DEFERRED to its own native connect reaction). Those reactions fire in
                // document order, so the throwing child's reaction precedes its following
                // siblings' — mark the shared render OWNER so each later sibling's connect
                // reaction (see top of connectedCallback) SKIPS its own upgrade/mount and
                // removes itself. A connectedCallback or renderedCallback throw happens AFTER
                // the child has fully rendered (past the abort point), so its siblings are
                // NOT aborted (mountPhase gates this — matching `x-after-throwing-child`
                // present for connected/rendered, absent for constructor/render).
                const throwInst = this[VM_SLOT] as VaporInstance | undefined;
                const abortedBeforeSiblings = !throwInst || throwInst.mountPhase === 'render';
                if (abortedBeforeSiblings) {
                    const abortOwner =
                        (this as DeferredHost)[DEFERRED_OWNER] ??
                        (this as DeferredHost)[DEFERRED_ERROR_OWNER] ??
                        (isFlushingAsync()
                            ? ((getCurrentOwner() as VaporInstance | null) ?? undefined)
                            : undefined);
                    if (abortOwner) {
                        (abortOwner as VaporInstance).abortDeferredChildMount = true;
                        // Clear the abort flag after this synchronous connect cascade so a
                        // later, unrelated mount of the same owner is unaffected.
                        queueMicrotask(() => {
                            (abortOwner as VaporInstance).abortDeferredChildMount = false;
                        });
                    }
                }
                // Prefer the render-time owner (DEFERRED_OWNER). Fall back to the
                // synchronous-reconcile routing owner (DEFERRED_ERROR_OWNER) for a
                // child created inside a ReactiveEffect.run() where currentInstance
                // was null (e.g. an error boundary's mid-mount branch toggle) — so its
                // throw reaches the boundary instead of escaping to window.onerror.
                const owner =
                    (this as DeferredHost)[DEFERRED_OWNER] ??
                    (this as DeferredHost)[DEFERRED_ERROR_OWNER] ??
                    // FLUSH-TIME fallback (errorCallback-throws-after-value-mutation):
                    // during flushAsyncQueue the enclosing createIf reconcile ran via
                    // ReactiveEffect.run(), which restored `currentOwner` (the parent
                    // boundary) but NOT `currentInstance`. So `createDeferredChild`
                    // captured no DEFERRED_OWNER (getCurrentInstance() was null) and the
                    // DEFERRED_ERROR_OWNER fallback is gated OFF during flush. Read the
                    // LIVE render owner so this child's throw can route to the boundary.
                    (isFlushingAsync()
                        ? ((getCurrentOwner() as VaporInstance | null) ?? undefined)
                        : undefined);
                // FLUSH-TIME CAPTURE (errorCallback-throws-after-value-mutation): during
                // flushAsyncQueue, capture {owner, err} and SWALLOW; flushAsyncQueue
                // dispatches it POST-DRAIN (see captureFlushError / setOnDeferredEffectError).
                if (owner && captureFlushError(owner, err)) {
                    return;
                }
                // Walk from the owner (parent) up its boundary chain. The owner
                // itself is a candidate (a child's error is caught by the parent's
                // errorCallback). Rethrow if nothing handles it.
                if (!owner || !handleErrorSelfOrAncestor(owner, err)) {
                    throw err;
                }
            }
        }
        disconnectedCallback() {
            // Synthetic lifecycle drives disconnect via DisconnectingSlot (see
            // monkeyPatchDomAPIs); skip the native reaction for such elements.
            if ((this as any)[SYNTHETIC_LIFECYCLE]) return;
            const instance = this[VM_SLOT];
            if (instance) unmountInstance(instance);
        }
        // Declaring `connectedMoveCallback` opts this element into atomic `moveBefore`
        // moves (reorderLightSlots): WITHOUT it Chromium DEGRADES moveBefore to
        // remove+insert and still fires disconnect/connect. Intentionally a no-op — a
        // relocation must not re-run the LWC connect/disconnect lifecycle.
        connectedMoveCallback() {}
        formAssociatedCallback(form: HTMLFormElement | null) {
            forwardFaceCallback(this[VM_SLOT], 'formAssociatedCallback', form);
        }
        formDisabledCallback(disabled: boolean) {
            forwardFaceCallback(this[VM_SLOT], 'formDisabledCallback', disabled);
        }
        formResetCallback() {
            forwardFaceCallback(this[VM_SLOT], 'formResetCallback');
        }
        formStateRestoreCallback(state: unknown, reason: string) {
            forwardFaceCallback(this[VM_SLOT], 'formStateRestoreCallback', state, reason);
        }
    };
    customElements.define(tagName, ElementClass);
    definedTags.set(tagName, Ctor);
}

/**
 * The `lwc` facade `createElement`. Mirrors the standard API contract: validates
 * options, defines (once) a custom element class for the tag that bridges the
 * native lifecycle to the vapor instance, and returns a host element.
 */
export function createElement(
    sel: string,
    options: CreateElementOptions,
    slotset?: Record<string, () => unknown>
): HTMLElement {
    if (typeof options !== 'object' || options === null) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${options}".`
        );
    }
    let Ctor = options.is;
    if (typeof Ctor !== 'function') {
        throw new TypeError(
            `"createElement" function expects an "is" option with a valid component constructor.`
        );
    }
    // Resolve a circular-module-dependency factory (Aura AMD interop): a function
    // tagged `__circular__` returns the real constructor (or its `default`).
    Ctor = resolveCircularModuleDependency(Ctor);
    // The constructor must extend LightningElement. A plain function or a class
    // that doesn't extend LightningElement is invalid (matching engine-core).
    if (!isLightningElementCtor(Ctor)) {
        throw new TypeError(
            `Invalid Component: ${Ctor.name || 'constructor'} does not extends LightningElement from "lwc".`
        );
    }

    const tagName = sel.toLowerCase();
    ensureCustomElementDefined(tagName, Ctor);

    const element = document.createElement(tagName);
    upgradeElement(element, Ctor, slotset, options.mode);

    // Honor `DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE`, read HERE (not at bundle init)
    // because it may be set lazily via `setFeatureFlagForTest`. In synthetic mode a
    // component must connect when appended to ANY parent — including a DETACHED one —
    // so mount is driven by the monkey-patched Node insertion APIs rather than the
    // browser's native custom-element reaction (which only fires on real document
    // connection). Mirrors engine-dom's `create-element.ts` synthetic path. The
    // element is flagged SYNTHETIC_LIFECYCLE so its native reaction is a no-op,
    // preventing a double-mount if it later joins the real document.
    if (getFeatureFlagValue('DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE')) {
        (element as any)[SYNTHETIC_LIFECYCLE] = true;
        monkeyPatchDomAPIs();
        ConnectingSlot.set(element, syntheticConnect);
        DisconnectingSlot.set(element, syntheticDisconnect);
    }
    return element;
}

/**
 * The `lwc` facade `hydrateComponent`. Vapor does not implement true SSR
 * hydration (no server-rendered DOM to adopt), but it must validate its arguments
 * exactly like engine-dom — and, when given a real element + valid component,
 * mount the component onto that element (the runtime-validation/error-path tests
 * exercise the argument checks; a full hydration would re-create the subtree). On
 * an invalid LightningElement constructor it logs engine-core's "is not a valid
 * component…" error (via getComponentDef) rather than throwing a bare TypeError.
 */
export function hydrateComponent(
    element: unknown,
    Ctor: unknown,
    props: Record<string, unknown> = {}
): void {
    if (!(element instanceof Element)) {
        throw new TypeError(
            `"hydrateComponent" expects a valid DOM element as the first parameter but instead received ${element}.`
        );
    }
    if (typeof Ctor !== 'function') {
        throw new TypeError(
            `"hydrateComponent" expects a valid component constructor as the second parameter but instead received ${Ctor}.`
        );
    }
    if (typeof props !== 'object' || props === null) {
        throw new TypeError(
            `"hydrateComponent" expects an object as the third parameter but instead received ${props}.`
        );
    }
    // An invalid component constructor logs engine-core's "is not a valid
    // component…" dev error (getComponentDef throws a TypeError with that message;
    // catch + log so the contract matches `toLogError`, then bail).
    const resolved = resolveCircularModuleDependency(Ctor);
    if (!isLightningElementCtor(resolved)) {
        try {
            getComponentDef(resolved);
        } catch (e) {
            logVaporError((e as Error).message);
        }
        return;
    }
    // Best-effort: mount a fresh instance onto the (already-connected) host. Vapor
    // has no SSR markup to adopt, so this re-renders into the element.
    const tagName = element.tagName.toLowerCase();
    ensureCustomElementDefined(tagName, resolved);
    upgradeElement(element as HTMLElement, resolved);
    if (props) {
        for (const key of Object.keys(props)) {
            (element as unknown as Record<string, unknown>)[key] = props[key];
        }
    }
    // Mount via the SSR-hydrate path: renders + patches the subtree while emitting
    // the hydrate profiler sequence (GlobalHydrate-bracketed Render + Patch, no
    // connected/rendered/GlobalRender ops), matching engine-dom's hydrate contract.
    const instance = (element as DeferredHost)[VM_SLOT];
    if (instance) mountForHydrate(instance);
}

/**
 * Wires a (freshly created or being-upgraded) host element to a new vapor
 * component instance: creates the instance, stores it in VM_SLOT, and exposes the
 * component's public props/methods/ARIA props on the host. Shared by
 * `createElement` and the `CustomElementConstructor` upgrade path.
 */
function upgradeElement(
    element: HTMLElement,
    Ctor: any,
    slotset?: Record<string, () => unknown>,
    mode?: 'open' | 'closed',
    tagNameOverride?: string
): VaporInstance {
    // Create the instance eagerly so props can be set before connection. The
    // upgraded custom element's connectedCallback mounts it when inserted.
    const instance = createComponentInstance(
        Ctor,
        element,
        undefined,
        slotset,
        mode,
        tagNameOverride
    );
    (element as any)[VM_SLOT] = instance;

    // Expose public props as accessors on the host element. When Locker hooks are
    // installed (setHooks), public-prop reads/writes route through getHook/setHook.
    const decorators = instance.decorators;
    if (decorators.publicProps) {
        for (const propName of Object.keys(decorators.publicProps)) {
            // An @api ACCESSOR (config > 0) declared with a getter but NO setter is
            // read-only: setting it from the host logs a dev error (matching
            // engine-core) and is otherwise a no-op. Detect via the component
            // prototype's descriptor.
            const config = (decorators.publicProps[propName] as { config?: number })?.config ?? 0;
            let getterOnlyAccessor = false;
            if (config > 0) {
                const desc = findProtoDescriptor(Ctor.prototype, propName);
                getterOnlyAccessor =
                    !!desc && typeof desc.get === 'function' && typeof desc.set !== 'function';
            }
            Object.defineProperty(element, propName, {
                get(this: any) {
                    // Resolve the VM from `this` (the host element), NOT the
                    // closed-over `instance`, so calling the descriptor with a
                    // foreign `this` (e.g. `descriptor.get.call({})`) throws a
                    // TypeError — matching engine-core, whose bridge accessor calls
                    // getAssociatedVM(this). See the "non-LightningElement this" spec.
                    const vm: VaporInstance = this[VM_SLOT];
                    const cmp = vm.component; // throws TypeError if vm is undefined
                    const getHook = vm.lockerHooks?.getHook ?? getLockerHooks().getHook;
                    if (getHook) return getHook(cmp, propName);
                    return (cmp as any)[propName];
                },
                set(this: any, value) {
                    const vm: VaporInstance = this[VM_SLOT];
                    const cmp = vm.component; // throws TypeError if vm is undefined
                    if (getterOnlyAccessor) {
                        logVaporError(
                            `Invalid attempt to set a new value for property "${propName}" that does not has a setter decorated with @api.`
                        );
                        return;
                    }
                    // A value passed IN from outside (a parent template binding or an
                    // imperative `elm.publicProp = ...`) is wrapped READ-ONLY so the
                    // child can't mutate the parent's object — engine-core's bridge
                    // setter does `newValue = getReadOnlyProxy(newValue)`. Mutating a
                    // received @api object value (`cmp.publicProp.x = 1`) then throws in
                    // dev (decorators/api "throws when setting a property of a public
                    // property"). Primitives pass through unchanged.
                    const readOnly = getReadOnlyProxy(value);
                    const setHook = vm.lockerHooks?.setHook ?? getLockerHooks().setHook;
                    if (setHook) {
                        setHook(cmp, propName, readOnly);
                        return;
                    }
                    (cmp as any)[propName] = readOnly;
                },
                enumerable: true,
                configurable: true,
            });
        }
    }
    // Expose public methods. When Locker hooks are installed, the call routes
    // through callHook(cmp, fn, args).
    if (decorators.publicMethods) {
        for (const methodName of decorators.publicMethods) {
            (element as any)[methodName] = (...args: unknown[]) => {
                const callHook = instance.lockerHooks?.callHook ?? getLockerHooks().callHook;
                const fn = (instance.component as any)[methodName];
                if (callHook) return callHook(instance.component, fn, args);
                return fn.apply(instance.component, args);
            };
        }
    }

    // Expose ARIA properties on the host element, routed through the component
    // instance so that setting them externally (e.g. elm.ariaChecked = 'true')
    // routes to the component (whose prototype ARIA accessor decides whether to
    // reflect to the attribute or store as a declared field) and triggers a
    // reactive re-render. Skip names already exposed via publicProps above.
    const declared = new Set([...Object.keys(decorators.publicProps ?? {})]);
    // Include `role` alongside the `ariaX` props (it reflects to the `role`
    // attribute the same way) so `elm.role = ...` routes through the component.
    for (const propName of [...Object.keys(ariaPropNames), 'role']) {
        if (declared.has(propName)) continue;
        Object.defineProperty(element, propName, {
            get() {
                return (instance.component as any)[propName];
            },
            set(value) {
                (instance.component as any)[propName] = value;
            },
            enumerable: true,
            configurable: true,
        });
    }

    // Reflective global HTML properties (id, title, hidden, dir, lang, accessKey,
    // tabIndex, draggable, spellcheck): route the HOST element's same-named
    // property through the component instance, so setting it externally (e.g.
    // `elm.id = 'x'`) goes through the component's reactive accessor (which
    // reflects to the host attribute via the native descriptor AND triggers a
    // re-render of any `{id}` template binding). Without this, the native host
    // property setter would bypass component reactivity. Skip names the component
    // declares as its own `@api` prop (those are already exposed above).
    for (const propName of REFLECTIVE_GLOBAL_PROP_NAMES) {
        if (declared.has(propName)) continue;
        Object.defineProperty(element, propName, {
            get() {
                return (instance.component as any)[propName];
            },
            set(value) {
                (instance.component as any)[propName] = value;
            },
            enumerable: true,
            configurable: true,
        });
    }

    // `formAssociated` and `attachInternals` are component-only: accessing them on
    // the host element logs a dev warning + returns undefined (matching engine-core's
    // bridge element). Safe to override the host's `attachInternals` because the
    // component's own `this.attachInternals()` uses the NATIVE method captured up
    // front (not this host accessor).
    if (process.env.NODE_ENV !== 'production') {
        Object.defineProperty(element, 'formAssociated', {
            get() {
                logVaporWarn(
                    'formAssociated cannot be accessed outside of a component. Set the value within the component class.'
                );
                return undefined;
            },
            set() {
                logVaporWarn(
                    'formAssociated cannot be accessed outside of a component. Set the value within the component class.'
                );
            },
            configurable: true,
        });
        Object.defineProperty(element, 'attachInternals', {
            get() {
                logVaporWarn(
                    'attachInternals cannot be accessed outside of a component. Use this.attachInternals instead.'
                );
                return undefined;
            },
            configurable: true,
        });
    }

    // Non-`@api` members (private methods/props defined on the component or its
    // superclasses) are NOT publicly accessible from the host. Accessing them
    // externally returns undefined and logs a dev warning (matching engine-core).
    defineNonPublicMemberWarnings(element, Ctor, decorators);

    return instance;
}

/**
 * For every member defined on the component's prototype chain that is NOT a
 * public (`@api`) prop/method, define a host accessor that returns undefined and
 * warns when accessed externally — matching engine-core's behavior where private
 * members aren't reachable from the element and a dev warning nudges adding @api.
 */
function defineNonPublicMemberWarnings(
    element: HTMLElement,
    Ctor: any,
    decorators: {
        publicProps?: Record<string, unknown>;
        publicMethods?: string[];
        fields?: string[];
        track?: Record<string, unknown>;
    }
): void {
    if (process.env.NODE_ENV === 'production') return;
    const isPublic = new Set<string>([
        ...Object.keys(decorators.publicProps ?? {}),
        ...(decorators.publicMethods ?? []),
    ]);
    const tag = element.tagName.toLowerCase();
    // Engine-core (base-bridge-element.ts HTMLBridgeElementFactory) only installs
    // these warning accessors for the class that DIRECTLY extends LightningElement
    // (gated on `!hasCustomSuperClass`), and scans ONLY that one prototype's OWN
    // descriptors — NOT the whole chain. A private member declared on an
    // intermediate superclass or on the subclass therefore gets NO warning
    // accessor. Walking the full chain (as we did) produced spurious
    // "not publicly accessible" warnings (api-with-superclasses cluster). Find the
    // base-most user class (whose prototype's prototype is LightningElement's) and
    // scan only its own prototype.
    let baseProto: any = Ctor.prototype;
    let guard = 0;
    while (baseProto && guard++ < 50) {
        const parent = Object.getPrototypeOf(baseProto);
        if (!parent || parent === Object.prototype) {
            // No LightningElement ancestor found (defensive); don't warn at all.
            baseProto = null;
            break;
        }
        // `baseProto` directly extends LightningElement when its parent prototype's
        // constructor IS LightningElement (the framework base).
        if (parent.constructor && parent.constructor.name === 'LightningElement') break;
        baseProto = parent;
    }
    // Collect non-public member names from the base class's OWN prototype, PLUS
    // class fields (observed fields) and @track fields, which live on the instance
    // (not the prototype) so the proto scan alone would miss them. Matches
    // engine-core, which seeds with observedFields too.
    const names = new Set<string>([
        ...(decorators.fields ?? []),
        ...Object.keys(decorators.track ?? {}),
    ]);
    if (baseProto) {
        for (const name of Object.getOwnPropertyNames(baseProto)) {
            if (name === 'constructor') continue;
            names.add(name);
        }
    }
    for (const name of names) {
        if (isPublic.has(name)) continue;
        // Don't clobber something already exposed (e.g. @api on a subclass, or a
        // built-in HTMLElement property that's meaningful on the element).
        if (Object.prototype.hasOwnProperty.call(element, name)) continue;
        if (name in HTMLElement.prototype) continue;
        Object.defineProperty(element, name, {
            get() {
                logNonPublicAccessWarning(name, tag);
                return undefined;
            },
            set() {
                logNonPublicAccessWarning(name, tag);
            },
            enumerable: true,
            configurable: true,
        });
    }
}

function logNonPublicAccessWarning(name: string, _tag: string): void {
    try {
        throw new Error(
            `[LWC warn]: The property "${name}" is not publicly accessible. ` +
                `Add the @api annotation to the property declaration or getter/setter ` +
                `in the component to make it accessible.`
        );
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
    }
}

/** console.warn a `[LWC warn]:`-prefixed Error (matches toLogWarningDev matcher). */
function logVaporWarn(message: string): void {
    try {
        throw new Error(`[LWC warn]: ${message}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
    }
}

/** console.error a `[LWC error]:`-prefixed Error (matches toLogErrorDev matcher). */
function logVaporError(message: string): void {
    try {
        throw new Error(`[LWC error]: ${message}`);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

/** Find an own property descriptor for `name` by walking up `proto`'s chain. */
function findProtoDescriptor(proto: object | null, name: string): PropertyDescriptor | undefined {
    let cur: object | null = proto;
    let guard = 0;
    while (cur && cur !== Object.prototype && guard++ < 100) {
        const desc = Object.getOwnPropertyDescriptor(cur, name);
        if (desc) return desc;
        cur = Object.getPrototypeOf(cur);
    }
    return undefined;
}

/**
 * Builds the `CustomElementConstructor` for a vapor component: a self-upgrading
 * custom-element class that, on construction, wires itself to a fresh vapor
 * instance and mounts on connection. This is what `Ctor.CustomElementConstructor`
 * returns (LWC's API for using a component as a standards-based custom element,
 * e.g. `customElements.define('x-foo', Cmp.CustomElementConstructor)`).
 */
export function buildCustomElementConstructor(Ctor: any): CustomElementConstructor {
    const formAssociated = (Ctor as { formAssociated?: boolean }).formAssociated === true;
    // Observed attributes = the kebab-case attribute names of the component's
    // public (`@api`) props, so attributeChangedCallback can reflect attr → prop
    // (LWC's standards-based custom element reflects observed attrs to @api props).
    const def = getComponentDef(Ctor);
    const attrToProp = new Map<string, string>();
    for (const propName of Object.keys(def.props ?? {})) {
        const attr = (def.props[propName] as { attr?: string }).attr ?? propName.toLowerCase();
        attrToProp.set(attr, propName);
    }
    const observed = [...attrToProp.keys()];
    return class extends HTMLElement {
        [VM_SLOT]?: VaporInstance;
        static formAssociated = formAssociated;
        static observedAttributes = observed;
        constructor() {
            super();
            // engine-dom's build-custom-element-constructor passes `this.tagName`
            // (the host element's tagName, UPPERCASE per the DOM) as the vm tagName,
            // whereas `createElement(sel)` passes the lowercased `sel`. Pass the raw
            // uppercase host tagName so reports (ShadowModeUsage etc.) emitted DURING
            // instance creation use it (mixed-shadow-mode/reporting CEC case).
            upgradeElement(
                this as unknown as HTMLElement,
                Ctor,
                undefined,
                undefined,
                this.tagName
            );
        }
        attributeChangedCallback(attrName: string, _old: string | null, newValue: string | null) {
            // Only reflect for an actual LWC-upgraded host. The constructor's
            // attributeChangedCallback can be borrowed and called on a plain native
            // element (W-17420330: `Ctor.prototype.attributeChangedCallback.call(
            // nativeEl, ...)`); without a VM that must be a no-op, not a reflection.
            if (!this[VM_SLOT]) return;
            // Reflect the changed attribute to its public property. Skip if the
            // property already equals the value (avoids prop→attr→prop loops).
            const propName = attrToProp.get(attrName);
            if (propName === undefined) return;
            const self = this as unknown as Record<string, unknown>;
            if (newValue === null) {
                if (self[propName] !== null && self[propName] !== undefined) self[propName] = null;
            } else if (self[propName] !== newValue) {
                self[propName] = newValue;
            }
        }
        connectedCallback() {
            const instance = this[VM_SLOT];
            // Light-DOM (and synthetic-shadow) custom elements cannot have
            // pre-existing child nodes when upgraded: those would be clobbered by
            // the rendered light-DOM content. Warn (dev) + clear them, matching
            // engine-dom's build-custom-element-constructor. Native-shadow
            // components ARE allowed pre-existing children (declarative slotted
            // content), so this only applies to LIGHT components in vapor.
            if (instance && instance.isLight && this.childNodes.length > 0) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `Light DOM and synthetic shadow custom elements cannot have child nodes. ` +
                            `Ensure the element is empty, including whitespace.`
                    );
                }
                while (this.firstChild) this.removeChild(this.firstChild);
            }
            if (instance) mountInstance(instance);
        }
        disconnectedCallback() {
            const instance = this[VM_SLOT];
            if (instance) unmountInstance(instance);
        }
        // See ElementClass.connectedMoveCallback: opts into atomic `moveBefore` so a
        // reorderLightSlots relocation does not fire disconnect/connect on Chromium.
        connectedMoveCallback() {}
        formAssociatedCallback(form: HTMLFormElement | null) {
            forwardFaceCallback(this[VM_SLOT], 'formAssociatedCallback', form);
        }
        formDisabledCallback(disabled: boolean) {
            forwardFaceCallback(this[VM_SLOT], 'formDisabledCallback', disabled);
        }
        formResetCallback() {
            forwardFaceCallback(this[VM_SLOT], 'formResetCallback');
        }
        formStateRestoreCallback(state: unknown, reason: string) {
            forwardFaceCallback(this[VM_SLOT], 'formStateRestoreCallback', state, reason);
        }
    };
}

/**
 * Instantiates a child LWC component for use inside a parent vapor template. The
 * compiler emits a call to this for `<x-child prop={...}>`: it resolves the host
 * custom element (reusing `createElement`), wires reactive prop getters from the
 * parent scope, and returns the host element as a Block. Because the host is a
 * real element, inserting it into the parent's block tree triggers its
 * upgraded custom-element `connectedCallback`, which mounts the child.
 *
 * `propGetters` maps public-prop name -> a getter that reads from the parent
 * `$cmp` (so the child stays reactive to parent state). The getters are read
 * inside a render effect by the caller's generated code where needed; here we
 * snapshot-and-subscribe by defining reactive forwarding.
 */
export function createChildComponent(
    sel: string,
    Ctor: any,
    propGetters?: Record<string, () => unknown>,
    slotset?: Record<string, () => unknown>,
    spreadGetter?: () => Record<string, unknown> | undefined
): HTMLElement | Comment {
    // Dynamic components (lwc:is/lwc:dynamic) may have no constructor yet; render
    // a placeholder comment until one is provided. (A fuller implementation would
    // swap reactively; for now we render once with the initial constructor.)
    if (typeof Ctor !== 'function') {
        return document.createComment('dynamic-component');
    }

    // Resolve a circular-module-dependency factory (Aura AMD interop): a template
    // referencing `<x-child>` whose module default-exports a `__circular__`-tagged
    // function (not the class directly). Must run BEFORE the LightningElement check
    // downstream, exactly as createElement does for the root.
    Ctor = resolveCircularModuleDependency(Ctor);
    // Resolve the ctor through the hot-swap map (dev HMR). createChildComponent is
    // re-invoked when the parent re-renders after swapComponent, picking up the
    // swapped definition here.
    const Resolved = resolveCtor(Ctor) as any;
    // Dev: scoped-slot content (`<template lwc:slot-data>` → a `.scoped` slot fn)
    // can only be passed to a LIGHT-DOM child. A native/shadow child never runs
    // the allocate-in-slot path, so the scoped content is silently dropped —
    // engine-core logs this in rendering.ts allocateChildren (the
    // `isVScopedSlotFragment` + non-light-renderMode guard). Match that message.
    if (process.env.NODE_ENV !== 'production' && slotset && !isLightComponent(Resolved)) {
        for (const name of Object.keys(slotset)) {
            if ((slotset[name] as { scoped?: boolean }).scoped) {
                logVaporError(
                    `Invalid usage of 'lwc:slot-data' on <${sel}> tag. Scoped slot content can only be passed to a light dom child.`
                );
                break;
            }
        }
    }
    // DEFER child construction to connect time (matching LWC lifecycle order:
    // a child constructs right before it connects, so siblings interleave
    // construct→connect→render rather than all constructing during parent render).
    // The host element is created now (so it's part of the parent's block), but
    // its component instance + slot projection happen in connectedCallback.
    const element = createDeferredChild(
        sel,
        Resolved,
        propGetters,
        bindSlotsetOwner(slotset),
        spreadGetter
    );
    return element;
}

/**
 * Wrap each slot-content fn so that when the CHILD later invokes it (e.g. a scoped
 * `<slot>` calling it via createSlot during the child's render), the slot body
 * runs with the PARENT (the slot's owner) as the current render owner. Slot
 * content belongs to the parent, so the reactive effects it creates must schedule
 * the PARENT's renderedCallback when the bound data changes — not the child's.
 * The owner is captured now, while we're on the parent's render call stack.
 */
function bindSlotsetOwner(
    slotset?: Record<string, () => unknown>
): Record<string, () => unknown> | undefined {
    if (!slotset) return slotset;
    const owner = getCurrentOwner();
    // Capture the OWNER INSTANCE (the component rendering this slotted content) too,
    // so any child components created when the slot fn runs LATER (during the slot
    // host's slot resolution) get `parent` = the slot owner, NOT the slot host. This
    // is what makes a slotted component an aChild of the host (parent!==host) for the
    // disconnect-order traversal, matching engine-core (callback-invocation-order).
    const ownerInstance = getCurrentInstance();
    if (!owner) return slotset;
    const wrapInOwner = (fn: ((data?: unknown) => unknown) & { scoped?: boolean }) => {
        const wrap = (data?: unknown) => {
            const prev = setCurrentOwner(owner);
            const prevInst = setCurrentInstance(ownerInstance);
            try {
                return fn(data);
            } finally {
                setCurrentOwner(prev);
                setCurrentInstance(prevInst);
            }
        };
        // Preserve the scoped-slot marker through the wrap so the runtime's
        // slot-type mismatch detection still works.
        if (fn.scoped) (wrap as { scoped?: boolean }).scoped = true;
        return wrap;
    };
    const wrapped: Record<string, unknown> = {};
    for (const name of Object.keys(slotset)) {
        // `$dynamic` (children with `slot={expr}`) is an ORDERED array of `{ name, fn }`
        // — wrap each entry's `fn` (preserving its name getter + order), not the array.
        if (name === '$dynamic') {
            const arr = slotset[name] as unknown as Array<{
                name: () => unknown;
                fn: ((data?: unknown) => unknown) & { scoped?: boolean };
            }>;
            wrapped[name] = arr.map((e) => ({ name: e.name, fn: wrapInOwner(e.fn) }));
            continue;
        }
        wrapped[name] = wrapInOwner(
            slotset[name] as ((data?: unknown) => unknown) & { scoped?: boolean }
        );
    }
    return wrapped as Record<string, () => unknown>;
}

/**
 * Run `fn` with `scope` re-established as the active effect scope (if one was
 * captured). Effects/subscriptions created inside `fn` then register their
 * cleanup with that scope, so they are torn down when the scope is stopped.
 * Falls back to running `fn` as-is when no scope was active at capture time.
 */
function wireWithScope(scope: EffectScope | undefined, fn: () => void): void {
    if (scope) {
        scope.run(fn);
    } else {
        fn();
    }
}

/**
 * Creates the child host element but defers component construction/mount to its
 * connectedCallback (see createChildComponent). The element is registered with a
 * one-time `__vaporUpgrade` callback that the custom element class invokes on
 * connect, before mountInstance.
 */
function createDeferredChild(
    sel: string,
    Ctor: any,
    propGetters?: Record<string, () => unknown>,
    slotset?: Record<string, () => unknown>,
    spreadGetter?: () => Record<string, unknown> | undefined
): HTMLElement {
    const tagName = sel.toLowerCase();
    ensureCustomElementDefined(tagName, Ctor);
    const element = document.createElement(tagName) as DeferredHost;
    // Capture the OWNER (the parent instance currently rendering) NOW, while we're
    // still on the parent's render call stack. Construction is deferred to connect
    // (inside the browser's CE reaction, where getCurrentInstance() would be null),
    // so we must restore the owner there for `instance.parent` to point at the
    // parent — otherwise the errorCallback boundary walk has nothing to climb.
    //
    // The owning parent instance. During a normal parent render `getCurrentInstance()`
    // is the parent. When this child is created while a SLOT BODY runs (a `<slot>`
    // invoking the parent's slot fn during the slot-HOST child's render), the
    // slotset-owner wrap restored `currentOwner` to the parent but `currentInstance`
    // can be null — so fall back to `getCurrentOwner()` (the same parent VaporInstance).
    // Without this, slotted child components (`<x-slotted>` inside a scoped slot) get
    // no owner, so their prop-forwarding effects schedule no renderedCallback for the
    // parent (scoped-slot rehydration W-12965122: child/parent rc never fire on
    // slotted re-render).
    //
    // The fallback is GATED to the slot-body case, detected by a live co-owner (the
    // slot host, set by createSlot's body). For a plain `lwc:if`/`for:each` deferred
    // child there is no co-owner, so `owner` stays `getCurrentInstance()` (its prior
    // behavior) — a broad fallback there routed deferred-reconcile errors in ways that
    // caused the errorCallback value-mutation file to hang.
    const coOwner = getCurrentCoOwner() as VaporInstance | null;
    const owner =
        getCurrentInstance() ??
        (coOwner ? (getCurrentOwner() as VaporInstance | null) : null) ??
        undefined;
    if (owner) element[DEFERRED_OWNER] = owner;
    // Capture the CO-OWNER too: when this child is created inside a scoped-slot body,
    // `currentCoOwner` is the slot-host CHILD. Its prop-forwarding effects must ALSO
    // schedule that host's renderedCallback (scoped-slot rehydration:
    // child:renderedCallback fires between slotted and parent). Only meaningful when
    // it differs from the owner.
    if (coOwner && coOwner !== owner) element[DEFERRED_CO_OWNER] = coOwner;
    // FALLBACK error-routing owner (see DEFERRED_ERROR_OWNER). When this child is
    // created during a SYNCHRONOUS reconcile — e.g. an error boundary whose
    // errorCallback toggled an `lwc:if` branch DURING its own initial mount (before
    // isMounted, so the createIf renderEffect re-runs synchronously) — we are inside
    // ReactiveEffect.run(), which restored currentOwner (the boundary) but NOT
    // currentInstance. So `owner` above is undefined and no DEFERRED_OWNER is set,
    // and a throw from this child's mount/renderedCallback would escape the
    // connectedCallback reaction to window.onerror instead of reaching the boundary
    // (matching engine-core's getErrorBoundaryVM(owner)). Capture getCurrentOwner()
    // as the routing fallback — but ONLY when NOT flushing the async batch. A child
    // created during flushAsyncQueue is a post-mount async reconcile whose error
    // routing must stay exactly as-is (a broad capture there re-routed the
    // errorCallback-throws-after-value-mutation cluster and hung the file).
    if (!owner && !isFlushingAsync()) {
        const errorOwner = getCurrentOwner() as VaporInstance | null;
        if (errorOwner) element[DEFERRED_ERROR_OWNER] = errorOwner;
    }
    // Capture the parent's currently-active EFFECT SCOPE now (the branch scope when
    // this child is inside an `lwc:if`/`for:each`, else the parent's render scope).
    // Prop wiring is deferred to connect (doUpgrade), which runs inside the browser
    // CE reaction — OUTSIDE any active scope. The prop getters read PARENT reactive
    // state (e.g. `signal={signal}`), so their effects + any trusted-signal
    // subscriptions must attach to the parent's scope; otherwise, when the branch
    // tears down (`lwc:if` → false), the parent-side subscription would never be
    // disposed (it would leak past the child's unmount). See subscribeInstanceToSignal.
    const ownerScope = getActiveScope();
    // The actual instance construction + prop wiring + slot projection, run once
    // at connect (or eagerly if something reads the instance before connect).
    let upgraded = false;
    const doUpgrade = () => {
        if (upgraded) return;
        upgraded = true;
        const prev = setCurrentInstance(owner ?? null);
        // Also restore the render OWNER so the prop-forwarding renderEffects capture
        // the PARENT as their owner. doUpgrade runs inside the CE connectedCallback
        // reaction (outside any render), where currentOwner would otherwise be
        // null/stale — so a later child-prop change wouldn't schedule the PARENT's
        // renderedCallback (lifecycle "children hooks when a public property change").
        const prevOwner = setCurrentOwner((owner as unknown) ?? null);
        // Restore the CO-OWNER (slot-host child) so prop-forwarding effects created by
        // wireChildProps schedule its renderedCallback too (scoped-slot rehydration).
        const deferredCoOwner = element[DEFERRED_CO_OWNER];
        const prevCoOwner = deferredCoOwner
            ? setCurrentCoOwner(deferredCoOwner)
            : (undefined as unknown as ReturnType<typeof setCurrentCoOwner>);
        try {
            upgradeElement(element, Ctor, slotset);
            wireWithScope(ownerScope, () => wireChildProps(element, propGetters, spreadGetter));
            // NOTE: slot projection for shadow components is intentionally NOT done
            // here. Projecting (inserting slotted content into the already-connected
            // host) synchronously fires the slotted children's connectedCallbacks.
            // Doing that during doUpgrade — which runs BEFORE mountInstance fires
            // THIS host's own connectedCallback — would connect the children before
            // their parent (violating LWC's top-down connectedCallback order).
            // Instead the instance records its slot owner and projects in
            // mountInstanceImpl, AFTER its connectedCallback and BEFORE its
            // renderedCallback (so children's cc+rc bracket correctly: parent cc →
            // children cc/rc → parent rc). See projectInstanceSlots.
            const inst = element[VM_SLOT];
            if (inst && slotset && !isLightComponent(Ctor)) {
                inst.slotOwner = owner ?? null;
            }
        } finally {
            setCurrentInstance(prev);
            setCurrentOwner(prevOwner);
            if (deferredCoOwner) setCurrentCoOwner(prevCoOwner);
        }
    };
    element[DEFERRED_UPGRADE] = doUpgrade;
    // Stash a recreate factory for a LIGHT child component: engine-core's keyed
    // light-DOM slot diff UNMOUNTS the old slotee and MOUNTS a fresh instance when its
    // `slot=` binding retargets to a different bucket. `recreateSlotee` (wired from the
    // slot-prop effect in wireChildProps) builds a NEW host with the same Ctor/props,
    // inserts it before the old, and removes the old — so a forwarded-slot reassignment
    // fires the recreate lifecycle ([newCc, oldDc]). Only meaningful for a light child
    // (a shadow child re-projects via native `<slot>` without recreation).
    if (isLightComponent(Ctor)) {
        (element as unknown as Record<symbol, unknown>)[RECREATE_SLOTEE] = () =>
            createDeferredChild(sel, Ctor, propGetters, slotset, spreadGetter);
    }
    return element;
}

/**
 * Recreate a light-DOM slotee whose `slot=` binding retargeted to a different bucket
 * (engine-core's keyed light-DOM slot diff unmounts the old, mounts a fresh instance).
 * Build a NEW host (same Ctor/props via the stashed factory), set its new slot attr,
 * insert it right before the old host, then remove the old. Insertion fires the new
 * host's connectedCallback (mount) via its native reaction; removal fires the old
 * host's disconnectedCallback — reproducing engine-core's [newCc, oldDc] sequence.
 */
function recreateSlotee(
    oldHost: HTMLElement,
    factory: () => HTMLElement,
    nextSlot: string | null
): HTMLElement | null {
    const parent = oldHost.parentNode;
    if (!parent) {
        // Not (yet) in the DOM: just reflect the new slot on the current host.
        if (nextSlot === null) oldHost.removeAttribute('slot');
        else oldHost.setAttribute('slot', nextSlot);
        return null;
    }
    const newHost = factory();
    // Stamp the new host's slot BEFORE it connects so it distributes into the correct
    // bucket on mount (its own slot propGetter re-applies the same value idempotently).
    if (nextSlot === null) newHost.removeAttribute('slot');
    else newHost.setAttribute('slot', nextSlot);
    // Carry the old host's slot-assignment tag (updated to the new bucket) onto the
    // replacement so the ordered-disconnect classifier still treats a NAMED-slot slotee
    // as a velement (walked reverse) rather than mis-binning it as a default aChild.
    transferSlotAssignment(oldHost, newHost, nextSlot === null ? '' : nextSlot);
    // Insert the NEW host first (fires its connectedCallback), then remove the OLD
    // (fires its disconnectedCallback) — engine-core mounts-new-before-unmounts-old.
    parent.insertBefore(newHost, oldHost);
    parent.removeChild(oldHost);
    return newHost;
}

// Wire the FORWARDING-slot recreate: a mid-level `<slot slot={expr}>` that retargets a
// LIGHT child-component slotee to a different bucket recreates it (engine-core keyed
// light-DOM slot diff). Returns the NEW host when it recreated, else null so slot.ts
// falls through to the in-place retag (plain `<p>` / non-recreatable hosts reposition).
setRecreateForwardedSlotee((el: Element, nextSlot: string): Element | null => {
    const recreate = (el as unknown as Record<symbol, unknown>)[RECREATE_SLOTEE] as
        (() => HTMLElement) | undefined;
    if (!recreate) return null;
    return recreateSlotee(el as HTMLElement, recreate, nextSlot === '' ? '' : nextSlot);
});

/**
 * Renders each slotted block in the parent scope and appends its nodes as
 * light-DOM children of the host, for native `<slot>` projection. Slotted
 * elements carry their own `slot="name"` attribute (from the compiled template),
 * so the browser routes them to the matching named/default slot.
 */
function isLightComponent(Ctor: any): boolean {
    return Ctor && (Ctor as { renderMode?: string }).renderMode === 'light';
}

/** Invoke a Form-Associated Custom Element callback on the component, if declared. */
function forwardFaceCallback(
    instance: VaporInstance | undefined,
    name: string,
    ...args: unknown[]
): void {
    if (!instance) return;
    const cb = (instance.reactiveTarget as Record<string, unknown>)[name];
    if (typeof cb === 'function') {
        (cb as (...a: unknown[]) => void).apply(instance.component, args);
    }
}

/** True if Ctor is LightningElement or a subclass (registered or via prototype chain). */
/**
 * Resolve a circular-module-dependency factory (Aura AMD interop): a function
 * tagged with an own `__circular__` property returns the real constructor when
 * invoked (unwrapping an ES-module `default` if present). Mirrors engine-core's
 * resolveCircularModuleDependency.
 */
function resolveCircularModuleDependency(Ctor: any): any {
    if (typeof Ctor === 'function' && Object.prototype.hasOwnProperty.call(Ctor, '__circular__')) {
        const mod = Ctor();
        return mod && mod.__esModule ? mod.default : mod;
    }
    return Ctor;
}

function isLightningElementCtor(Ctor: any): boolean {
    if (isComponentConstructor(Ctor)) return true;
    // Fallback: walk the prototype chain for a constructor named LightningElement
    // (covers locker "mirror" classes and subclasses registered indirectly). Also
    // accept a chain whose base is a `__circular__` factory (Locker's
    // SecureBaseClass mirror) — it constructs as a LightningElement at runtime.
    let proto = Ctor;
    let guard = 0;
    while (proto && guard++ < 100) {
        if (proto.name === 'LightningElement') return true;
        if (
            typeof proto === 'function' &&
            Object.prototype.hasOwnProperty.call(proto, '__circular__')
        ) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

// Wire the at-mount slot-projection hook so lightning-element's mountInstanceImpl
// can project slots AFTER the host's connectedCallback (top-down cc) and before
// its renderedCallback (bottom-up rc). Restores `owner` as the current instance so
// projected child hosts capture the correct `parent`.
// Provide createChildComponent to the ACT (VDOM) compat shim (injection avoids a
// circular import).
setActCreateChildComponent(createChildComponent);

setProjectSlotsHook((host, slotset, owner) => {
    const prev = setCurrentInstance(owner);
    try {
        projectSlots(host, slotset);
    } finally {
        setCurrentInstance(prev);
    }
});

function projectSlots(host: HTMLElement, slotset?: Record<string, () => unknown>): void {
    if (!slotset) return;
    for (const name of Object.keys(slotset)) {
        // `$dynamic` (children with `slot={expr}`): render each entry IN DOCUMENT ORDER
        // and append. Each child's `slot` attribute is set reactively by its own
        // `setProp(n, "slot", expr)`, so the browser natively projects it into the
        // matching shadow `<slot>` (engine-core reads the resolved attribute). Appending
        // in order keeps the host light DOM in document order (textContent relies on it).
        if (name === '$dynamic') {
            const arr = slotset[name] as unknown as Array<{
                name: () => unknown;
                fn: () => unknown;
            }>;
            for (const entry of arr) {
                let blk: Block;
                try {
                    blk = entry.fn() as Block;
                } catch {
                    continue;
                }
                insertBlock(blk, host, null);
            }
            continue;
        }
        let block: Block;
        try {
            block = slotset[name]() as Block;
        } catch {
            continue;
        }
        // For NAMED slots, tag ONLY a slotted child COMPONENT's host element with
        // `slot="name"` (its host has no slot attribute, unlike native elements
        // authored as `<span slot="x">` which keep it via the static template). We
        // do NOT touch native elements or descend into fragments — conditional
        // content already carries its own (possibly different) slot attributes.
        if (name !== '') {
            retagProjectedSlot(block, name);
        }
        // Append into the host's light DOM (anchor=null => append in order).
        insertBlock(block, host, null);
    }
}

/**
 * Set `slot="name"` on the top-level Element nodes of a projected slot block.
 *
 * Only DIRECT top-level Element nodes (and arrays thereof) are tagged — we do NOT
 * descend into fragments (DynamicFragment/VaporFragment). A conditional/iterator
 * fragment can contain content authored for DIFFERENT slots (each already carrying
 * its own `slot="..."` from the compiled static template), so descending would
 * wrongly re-tag default-slot content with this named-slot's name. We also never
 * overwrite an existing `slot` attribute.
 */
function retagProjectedSlot(block: Block, name: string): void {
    if (block == null) return;
    if (Array.isArray(block)) {
        for (const b of block) retagProjectedSlot(b as Block, name);
        return;
    }
    if (block instanceof Element) {
        // Only tag custom-element hosts (tag name contains '-'). Native elements
        // authored for a named slot already carry their `slot=` attribute from the
        // compiled static template; tagging them (or any element that lacks the
        // attribute because it was authored for the DEFAULT slot) would misroute it.
        if (block.tagName.includes('-') && !block.hasAttribute('slot')) {
            block.setAttribute('slot', name);
        }
    }
    // Intentionally do NOT descend into fragments/instances.
}

/**
 * Dynamic component (`lwc:is`/`lwc:dynamic`/`<lwc:component>`): the constructor is
 * a reactive expression that may start undefined and resolve (or change) later.
 * Returns a DynamicFragment that (re)creates the child host whenever the resolved
 * constructor changes, mounting/unmounting it via the fragment's own scope. This
 * mirrors Vue Vapor's dynamic-component handling (a reactive block keyed on the
 * resolved type).
 */
export function createDynamicComponent(
    sel: string,
    ctorGetter: () => any,
    propGetters?: Record<string, () => unknown>,
    slotset?: Record<string, () => unknown>,
    spreadGetter?: () => Record<string, unknown> | undefined,
    refName?: string,
    events?: Array<{ event: string; handler: EventListener }>
): Block {
    const frag = new DynamicFragment();
    // Capture the OWNER instance now (synchronously, during the parent's render).
    // The renderEffect below can re-run later in a reactive trigger when the
    // current-instance is null, so we can't rely on getCurrentInstance() there.
    const owner = refName ? getCurrentInstance() : null;
    // Bind slot content to the parent owner now (same reason — the renderEffect
    // re-runs with no current owner). See bindSlotsetOwner.
    const ownedSlotset = bindSlotsetOwner(slotset);
    renderEffect(() => {
        const Ctor = ctorGetter();
        // Key on the constructor itself so the fragment only tears down/rebuilds
        // when the resolved component type actually changes.
        if (typeof Ctor !== 'function') {
            frag.update(undefined, undefined);
            return;
        }
        frag.update(() => {
            // For the `<lwc:component lwc:is={ctor}>` placeholder, use the resolved
            // component's REGISTERED tag (`x-foo`) so the rendered element's tagName
            // matches LWC. But for the LEGACY `lwc:dynamic` form, the authored tag
            // (`<x-cmp lwc:dynamic={ctor}>`) is kept verbatim — only the
            // `lwc-component` placeholder should be replaced (spread/lwc:dynamic test).
            let resolvedSel = sel;
            if (sel === 'lwc-component') {
                try {
                    const def = getComponentDef(Ctor) as { sel?: string };
                    if (def && def.sel) resolvedSel = def.sel;
                } catch {
                    /* not a registered component; keep placeholder */
                }
            }
            const element = createElement(resolvedSel, { is: Ctor }, ownedSlotset) as HTMLElement;
            wireChildProps(element, propGetters, spreadGetter);
            // Host event listeners (`<lwc:component lwc:is onclick={fn}>`): attach to
            // the resolved host (the returned fragment can't carry listeners).
            if (events) {
                for (const { event, handler } of events) {
                    element.addEventListener(event, handler);
                }
            }
            // Project slotted content into the resolved host's light DOM (for
            // native `<slot>` projection in shadow components). Defer to mount
            // (via slotOwner, like the createChildComponent path) so the dynamic
            // host's own connectedCallback fires before the slotted children's.
            if (ownedSlotset && !isLightComponent(Ctor)) {
                const inst = (element as DeferredHost)[VM_SLOT];
                if (inst) inst.slotOwner = owner ?? getCurrentInstance() ?? null;
            }
            // `lwc:ref` on a dynamic component: register the resolved host element
            // on the owner (the fragment, being a Block, can't be a ref target).
            if (refName && owner) {
                setInstanceRef(owner, refName, element);
            }
            return element;
        }, Ctor);
    });
    return frag;
}

/** Apply one prop to a child host, mapping kebab→camel for declared props. */
function applyChildProp(element: HTMLElement, key: string, value: unknown): void {
    // `aria-*` attributes on a child COMPONENT map to the corresponding camelCase
    // ARIA property (`aria-label` → `ariaLabel`), so the child's own getter/setter
    // (or the host's ARIA accessor) runs — matching engine-core's
    // attribute→property conversion for custom elements (aom-setter). `data-*`
    // stays an attribute. (applyChildProp is only ever called for child component
    // hosts, so this never affects native elements.)
    const camel =
        key.includes('-') && !key.startsWith('data-')
            ? key.replace(/-([a-z])/g, (_m, c) => c.toUpperCase())
            : key;
    const propKey = camel !== key && camel in element ? camel : key;
    // Dev warning for an unknown public property on a child COMPONENT: the authored
    // attribute camelized to a prop name that isn't on the element (not a declared
    // @api prop, not a global). Matches engine-core's modules/props.ts. Scoped
    // tightly to avoid false positives: only custom-element hosts, only keys that
    // aren't data-*/aria-*/class/style/key/slot, and only when neither the kebab
    // key nor its camel form exists on the element.
    if (
        process.env.NODE_ENV !== 'production' &&
        typeof element.tagName === 'string' &&
        element.tagName.includes('-') &&
        !key.startsWith('data-') &&
        !key.startsWith('aria-') &&
        key !== 'class' &&
        key !== 'style' &&
        key !== 'key' &&
        key !== 'slot' &&
        key !== 'role' &&
        !(key in element) &&
        !(camel in element)
    ) {
        const kebab = key.includes('-') ? key : key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
        try {
            throw new Error(
                `[LWC warn]: Unknown public property "${camel}" of element <${element.tagName.toLowerCase()}>. ` +
                    `This is either a typo on the corresponding attribute "${kebab}", or ` +
                    `the attribute does not exist in this browser or DOM implementation.`
            );
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);
        }
    }
    // Declared public props (host accessors) are set as properties; everything
    // else (data-*, class, aria-*, unknown attrs) reflects to attributes via
    // setProp's `key in el ? property : attribute` rule. Suppress the render/template
    // side-effect dev guard: writing a child's `@api` prop here (during the parent's
    // reactive prop-application effect re-run, which raises globalIsUpdatingTemplate) is
    // the normal cross-component prop flow, not a side effect (engine-core doesn't flag it).
    withSuppressedSideEffectCheck(() => {
        if (propKey === 'class' || propKey === 'className') {
            setClass(element, value);
        } else if (propKey === 'style') {
            setStyle(element as HTMLElement, value);
        } else {
            setProp(element, propKey, value);
        }
    });
}

/** Wire reactive prop getters and an optional spread getter onto a child host. */
function wireChildProps(
    element: HTMLElement,
    propGetters?: Record<string, () => unknown>,
    spreadGetter?: () => Record<string, unknown> | undefined
): void {
    // When a `lwc:spread={obj}` is present, static/template props and the spread
    // must layer deterministically: template props first, then spread OVERRIDES
    // them, and when a spread key is removed the template value is RESTORED. Apply
    // both in ONE effect so ordering + restoration are correct (matching LWC).
    if (spreadGetter) {
        let prevSpreadKeys: string[] = [];
        renderEffect(() => {
            try {
                // Base layer: template/static props. Read tracked, apply untracked
                // (see the no-spread branch for why the apply must not subscribe).
                if (propGetters) {
                    for (const key of Object.keys(propGetters)) {
                        const v = propGetters[key]();
                        untrack(() => applyChildProp(element, key, v));
                    }
                }
                // Override layer: spread props (win over template props). Read each
                // value TRACKED (so assigning a tracked prop on the spread object
                // re-runs this effect — lwc:spread "should rerender when tracked props
                // are assigned"), then apply untracked (so the diff read-back doesn't
                // subscribe this effect to the prop it's writing).
                const spread = spreadGetter() || {};
                const spreadKeys = Object.keys(spread);
                for (const key of spreadKeys) {
                    const v = (spread as Record<string, unknown>)[key];
                    untrack(() => applyChildProp(element, key, v));
                }
                prevSpreadKeys = spreadKeys;
            } catch {
                // ignore prop wiring errors for unsupported shapes
            }
        });
        void prevSpreadKeys;
        return;
    }

    // No spread: each prop in its own effect so a single prop change updates only
    // that prop on the child (keeps `<x-child value={item.value}>` reactive in
    // for:each without re-applying every prop).
    if (propGetters) {
        // Does this host recreate on a slot retarget (a LIGHT child component)? Engine-
        // core's keyed light-DOM slot diff recreates the slotee instance when its `slot=`
        // binding moves it to a different bucket; a plain element / shadow child just
        // repositions or re-projects. Gate the recreate to a host carrying the factory.
        const recreate = (element as unknown as Record<symbol, unknown>)[RECREATE_SLOTEE] as
            (() => HTMLElement) | undefined;
        for (const key of Object.keys(propGetters)) {
            const getter = propGetters[key];
            if (key === 'slot' && recreate) {
                // SLOT-RETARGET RECREATE (light child): the first run applies the initial
                // `slot=` (no recreate); a later CHANGE tears the current instance down and
                // mounts a fresh host in its place — matching engine-core's recreate.
                let prevSlot: unknown;
                let first = true;
                renderEffect(() => {
                    let v: unknown;
                    try {
                        v = getter();
                    } catch {
                        return;
                    }
                    const next = v == null ? null : String(v);
                    if (first) {
                        first = false;
                        prevSlot = next;
                        untrack(() => applyChildProp(element, key, v));
                        return;
                    }
                    if (next === prevSlot) return;
                    prevSlot = next;
                    untrack(() => recreateSlotee(element, recreate, next));
                });
                continue;
            }
            renderEffect(() => {
                try {
                    // Read the value TRACKED (so a dynamic getter subscribes to its
                    // source), but APPLY it untracked: applyChildProp diffs against the
                    // element's current property (reading the host's reactive ARIA/global
                    // accessor), and that read-back must not subscribe THIS effect to the
                    // property it's writing — otherwise an external write to that prop
                    // re-runs this effect and reverts to the template value (attribute-aria
                    // "can mutate aria prop from outside").
                    const v = getter();
                    untrack(() => applyChildProp(element, key, v));
                } catch {
                    // ignore prop wiring errors for unsupported shapes
                }
            });
        }
    }
}
