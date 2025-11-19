/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    create,
    defineProperty,
    getOwnPropertyNames,
    isArray,
    flattenStylesheets,
} from '@lwc/shared';

import { addErrorComponentStack } from '../shared/error';
import { logError, logWarnOnce } from '../shared/logger';

import {
    renderComponent,
    markComponentAsDirty,
    getTemplateReactiveObserver,
    getComponentAPIVersion,
    resetTemplateObserverAndUnsubscribe,
    supportsSyntheticElementInternals,
} from './component';
import { addCallbackToNextTick, EmptyArray, EmptyObject } from './utils';
import { invokeComponentCallback, invokeComponentConstructor } from './invoker';
import { getComponentInternalDef } from './def';
import {
    logOperationStart,
    logOperationEnd,
    OperationId,
    logGlobalOperationEnd,
    logGlobalOperationStart,
    logGlobalOperationStartWithVM,
    logGlobalOperationEndWithVM,
} from './profiler';
import { patchChildren } from './rendering';
import { flushMutationLogsForVM, getAndFlushMutationLogs } from './mutation-logger';
import { connectWireAdapters, disconnectWireAdapters, installWireAdapters } from './wiring';
import { VNodeType, isVFragment } from './vnodes';
import { isReportingEnabled, report, ReportingEventId } from './reporting';
import { connectContext, disconnectContext } from './modules/context';
import type { VNodes, VCustomElement, VNode, VBaseElement, VStaticPartElement } from './vnodes';
import type { ReactiveObserver } from './mutation-tracker';
import type {
    LightningElement,
    LightningElementConstructor,
    LightningElementShadowRoot,
} from './base-lightning-element';
import type { ComponentDef } from './def';
import type { Template } from './template';
import type { HostNode, HostElement, RendererAPI } from './renderer';
import type { Stylesheet, Stylesheets, APIVersion } from '@lwc/shared';

type ShadowRootMode = 'open' | 'closed';

export interface TemplateCache {
    [key: string]: any;
}

export interface SlotSet {
    // Slot assignments by name
    slotAssignments: { [key: string]: VNodes };
    owner?: VM;
}

export const enum VMState {
    created,
    connected,
    disconnected,
}

export const enum RenderMode {
    Light,
    Shadow,
}

export const enum ShadowMode {
    Native,
    Synthetic,
}

export type ShadowSupportMode = 'any' | 'reset' | 'native';

export interface Context {
    /** The string used for synthetic shadow DOM and light DOM style scoping. */
    stylesheetToken: string | undefined;
    /** True if a stylesheetToken was added to the host class */
    hasTokenInClass: boolean | undefined;
    /** True if a stylesheetToken was added to the host attributes */
    hasTokenInAttribute: boolean | undefined;
    /** The legacy string used for synthetic shadow DOM and light DOM style scoping. */
    // TODO [#3733]: remove support for legacy scope tokens
    legacyStylesheetToken: string | undefined;
    /** True if a legacyStylesheetToken was added to the host class */
    hasLegacyTokenInClass: boolean | undefined;
    /** True if a legacyStylesheetToken was added to the host attributes */
    hasLegacyTokenInAttribute: boolean | undefined;
    /** Whether or not light DOM scoped styles are present in the stylesheets. */
    hasScopedStyles: boolean | undefined;
    /** The VNodes injected in all the shadow trees to apply the associated component stylesheets. */
    styleVNodes: VNode[] | null;
    /**
     * Object used by the template function to store information that can be reused between
     * different render cycle of the same template.
     */
    tplCache: TemplateCache;
    /** List of wire hooks that are invoked when the component gets connected. */
    wiredConnecting: Array<() => void>;
    /** List of wire hooks that are invoked when the component gets disconnected. */
    wiredDisconnecting: Array<() => void>;
}

export type RefVNodes = { [name: string]: VBaseElement | VStaticPartElement };

export interface VM<N = HostNode, E = HostElement> {
    /** The host element */
    readonly elm: HostElement;
    /** The host element tag name */
    readonly tagName: string;
    /** The component definition */
    readonly def: ComponentDef;
    /** The component context object. */
    readonly context: Context;
    /** The owner VM or null for root elements. */
    readonly owner: VM<N, E> | null;
    /** References to elements rendered using lwc:ref (template refs) */
    refVNodes: RefVNodes | null;
    /** event listeners added to elements corresponding to functions provided by lwc:on */
    attachedEventListeners: WeakMap<Element, Record<string, EventListener | undefined>>;
    /** Whether or not the VM was hydrated */
    readonly hydrated: boolean;
    /** Rendering operations associated with the VM */
    renderMode: RenderMode;
    shadowMode: ShadowMode;
    /** True if shadow migrate mode is in effect, i.e. this is native with synthetic-like modifications */
    shadowMigrateMode: boolean;
    /** The component creation index. */
    idx: number;
    /** Component state, analogous to Element.isConnected */
    /** The component connection state. */
    state: VMState;
    /** The list of VNodes associated with the shadow tree. */
    children: VNodes;
    /** The list of adopted children VNodes. */
    aChildren: VNodes;
    /**
     * The list of custom elements VNodes currently rendered in the shadow tree. We keep track of
     * those elements to efficiently unmount them when the parent component is disconnected without
     * having to traverse the VNode tree.
     */
    velements: VCustomElement[];
    /** The component public properties. */
    cmpProps: { [name: string]: any };
    /**
     * Contains information about the mapping between the slot names and the slotted VNodes, and
     * the owner of the slot content.
     */
    cmpSlots: SlotSet;
    /** The component internal reactive properties. */
    cmpFields: { [name: string]: any };
    /** Flag indicating if the component has been scheduled for rerendering. */
    isScheduled: boolean;
    /** Flag indicating if the component internal should be scheduled for re-rendering. */
    isDirty: boolean;
    /** The shadow DOM mode. */
    mode: ShadowRootMode;
    /** The template method returning the VDOM tree. */
    cmpTemplate: Template | null;
    /** The component instance. */
    component: LightningElement;
    /** The custom element shadow root. */
    shadowRoot: LightningElementShadowRoot | null;
    /**
     * The component render root. If the component is a shadow DOM component, it is its shadow
     * root. If the component is a light DOM component it the element itself.
     */
    renderRoot: LightningElementShadowRoot | HostElement;
    /** The template reactive observer. */
    tro: ReactiveObserver;
    /**
     * Hook invoked whenever a property is accessed on the host element. This hook is used by
     * Locker only.
     */
    setHook: (cmp: LightningElement, prop: PropertyKey, newValue: any) => void;
    /**
     * Hook invoked whenever a property is set on the host element. This hook is used by Locker
     * only.
     */
    getHook: (cmp: LightningElement, prop: PropertyKey) => any;
    /**
     * Hook invoked whenever a method is called on the component (life-cycle hooks, public
     * properties and event handlers). This hook is used by Locker.
     */
    callHook: (cmp: LightningElement | undefined, fn: (...args: any[]) => any, args?: any[]) => any;
    /**
     * Renderer API
     */
    renderer: RendererAPI;
    /**
     * Debug info bag. Stores useful debug information about the component.
     */
    debugInfo?: Record<string, any>;
    /**
     * Any stylesheets associated with the component
     */
    stylesheets: Stylesheets | null;
    /**
     * API version associated with this VM
     */
    apiVersion: APIVersion;
}

type VMAssociable = HostNode | LightningElement;

let idx: number = 0;

/** The internal slot used to associate different objects the engine manipulates with the VM */
const ViewModelReflection = new WeakMap<any, VM>();

function callHook(
    cmp: LightningElement | undefined,
    fn: (...args: any[]) => any,
    args: any[] = []
): any {
    return fn.apply(cmp, args);
}

function setHook(cmp: LightningElement, prop: PropertyKey, newValue: any) {
    (cmp as any)[prop] = newValue;
}

function getHook(cmp: LightningElement, prop: PropertyKey): any {
    return (cmp as any)[prop];
}

export function rerenderVM(vm: VM) {
    rehydrate(vm);
}

export function connectRootElement(elm: any) {
    const vm = getAssociatedVM(elm);

    if (process.env.NODE_ENV !== 'production') {
        // Flush any logs for this VM so that the initial properties from the constructor don't "count"
        // in subsequent re-renders (lwc-rerender). Right now we're at the first render (lwc-hydrate).
        flushMutationLogsForVM(vm);
    }

    logGlobalOperationStartWithVM(OperationId.GlobalRender, vm);

    // Usually means moving the element from one place to another, which is observable via
    // life-cycle hooks.
    if (vm.state === VMState.connected) {
        disconnectRootElement(elm);
    }

    runConnectedCallback(vm);
    rehydrate(vm);

    logGlobalOperationEndWithVM(OperationId.GlobalRender, vm);
}

export function disconnectRootElement(elm: any) {
    const vm = getAssociatedVM(elm);
    resetComponentStateWhenRemoved(vm);
}

export function appendVM(vm: VM) {
    rehydrate(vm);
}

// just in case the component comes back, with this we guarantee re-rendering it
// while preventing any attempt to rehydration until after reinsertion.
function resetComponentStateWhenRemoved(vm: VM) {
    const { state } = vm;

    if (state !== VMState.disconnected) {
        // Making sure that any observing record will not trigger the rehydrated on this vm
        resetTemplateObserverAndUnsubscribe(vm);
        runDisconnectedCallback(vm);
        // Spec: https://dom.spec.whatwg.org/#concept-node-remove (step 14-15)
        runChildNodesDisconnectedCallback(vm);
        runLightChildNodesDisconnectedCallback(vm);
    }
}

// this method is triggered by the diffing algo only when a vnode from the
// old vnode.children is removed from the DOM.
export function removeVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        if (lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
            // With native lifecycle, we cannot be certain that connectedCallback was called before a component
            // was removed from the VDOM. If the component is disconnected, then connectedCallback will not fire
            // in native mode, although it will fire in synthetic mode due to appendChild triggering it.
            // See: W-14037619 for details
            assert.isTrue(
                vm.state === VMState.connected || vm.state === VMState.disconnected,
                `${vm} must have been connected.`
            );
        }
    }
    resetComponentStateWhenRemoved(vm);
}

function getNearestShadowAncestor(owner: VM | null): VM | null {
    let ancestor = owner;
    while (!isNull(ancestor) && ancestor.renderMode === RenderMode.Light) {
        ancestor = ancestor.owner;
    }
    return ancestor;
}

export function createVM<HostNode, HostElement>(
    elm: HostElement,
    ctor: LightningElementConstructor,
    renderer: RendererAPI,
    options: {
        mode: ShadowRootMode;
        owner: VM<HostNode, HostElement> | null;
        tagName: string;
        hydrated?: boolean;
    }
): VM {
    const { mode, owner, tagName, hydrated } = options;
    const def = getComponentInternalDef(ctor);
    const apiVersion = getComponentAPIVersion(ctor);

    const vm: VM = {
        elm,
        def,
        idx: idx++,
        state: VMState.created,
        isScheduled: false,
        isDirty: true,
        tagName,
        mode,
        owner,
        refVNodes: null,
        attachedEventListeners: new WeakMap(),
        children: EmptyArray,
        aChildren: EmptyArray,
        velements: EmptyArray,
        cmpProps: create(null),
        cmpFields: create(null),
        cmpSlots: { slotAssignments: create(null) },
        cmpTemplate: null,
        hydrated: Boolean(hydrated),

        renderMode: def.renderMode,
        context: {
            stylesheetToken: undefined,
            hasTokenInClass: undefined,
            hasTokenInAttribute: undefined,
            legacyStylesheetToken: undefined,
            hasLegacyTokenInClass: undefined,
            hasLegacyTokenInAttribute: undefined,
            hasScopedStyles: undefined,
            styleVNodes: null,
            tplCache: EmptyObject,
            wiredConnecting: EmptyArray,
            wiredDisconnecting: EmptyArray,
        },

        // Properties set right after VM creation.
        tro: null!,
        shadowMode: null!,
        shadowMigrateMode: false,
        stylesheets: null!,

        // Properties set by the LightningElement constructor.
        component: null!,
        shadowRoot: null!,
        renderRoot: null!,

        callHook,
        setHook,
        getHook,

        renderer,
        apiVersion,
    };

    if (process.env.NODE_ENV !== 'production') {
        vm.debugInfo = create(null);
    }

    vm.stylesheets = computeStylesheets(vm, def.ctor);
    const computedShadowMode = computeShadowMode(def, vm.owner, renderer, hydrated);
    if (lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE) {
        vm.shadowMode = ShadowMode.Native;
        vm.shadowMigrateMode = computedShadowMode === ShadowMode.Synthetic;
    } else {
        vm.shadowMode = computedShadowMode;
    }
    vm.tro = getTemplateReactiveObserver(vm);

    // We don't need to report the shadow mode if we're rendering in light DOM
    if (isReportingEnabled() && vm.renderMode === RenderMode.Shadow) {
        report(ReportingEventId.ShadowModeUsage, {
            tagName: vm.tagName,
            mode: vm.shadowMode,
        });
    }

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }

    // Create component instance associated to the vm and the element.
    invokeComponentConstructor(vm, def.ctor);

    // Initializing the wire decorator per instance only when really needed
    if (hasWireAdapters(vm)) {
        installWireAdapters(vm);
    }

    return vm;
}

function validateComponentStylesheets(vm: VM, stylesheets: Stylesheets): boolean {
    let valid = true;

    const validate = (arrayOrStylesheet: Stylesheets | Stylesheet) => {
        if (isArray(arrayOrStylesheet)) {
            for (let i = 0; i < arrayOrStylesheet.length; i++) {
                validate(arrayOrStylesheet[i]);
            }
        } else if (!isFunction(arrayOrStylesheet)) {
            // function assumed to be a stylesheet factory
            valid = false;
        }
    };

    if (!isArray(stylesheets)) {
        valid = false;
    } else {
        validate(stylesheets);
    }

    return valid;
}

// Validate and flatten any stylesheets defined as `static stylesheets`
function computeStylesheets(vm: VM, ctor: LightningElementConstructor) {
    warnOnStylesheetsMutation(ctor);
    const { stylesheets } = ctor;
    if (!isUndefined(stylesheets)) {
        const valid = validateComponentStylesheets(vm, stylesheets);

        if (valid) {
            return flattenStylesheets(stylesheets);
        } else if (process.env.NODE_ENV !== 'production') {
            logError(
                `static stylesheets must be an array of CSS stylesheets. Found invalid stylesheets on <${vm.tagName}>`,
                vm
            );
        }
    }
    return null;
}

function warnOnStylesheetsMutation(ctor: LightningElementConstructor) {
    if (process.env.NODE_ENV !== 'production') {
        let { stylesheets } = ctor;
        defineProperty(ctor, 'stylesheets', {
            enumerable: true,
            configurable: true,
            get() {
                return stylesheets;
            },
            set(newValue) {
                logWarnOnce(
                    `Dynamically setting the "stylesheets" static property on ${ctor.name} ` +
                        'will not affect the stylesheets injected.'
                );
                stylesheets = newValue;
            },
        });
    }
}

// Compute the shadowMode/renderMode without creating a VM. This is used in some scenarios like hydration.
export function computeShadowAndRenderMode(
    Ctor: LightningElementConstructor,
    renderer: RendererAPI
) {
    const def = getComponentInternalDef(Ctor);
    const { renderMode } = def;

    // Assume null `owner` - this is what happens in hydration cases anyway
    // Also assume we are not in hydration mode for this exported API
    const shadowMode = computeShadowMode(def, /* owner */ null, renderer, false);

    return { renderMode, shadowMode };
}

function computeShadowMode(
    def: ComponentDef,
    owner: VM | null,
    renderer: RendererAPI,
    hydrated: boolean | undefined
) {
    if (
        // Force the shadow mode to always be native. Used for running tests with synthetic shadow patches
        // on, but components running in actual native shadow mode
        (process.env.NODE_ENV === 'test-lwc-integration' &&
            process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST) ||
        // If synthetic shadow is explicitly disabled, use pure-native
        lwcRuntimeFlags.DISABLE_SYNTHETIC_SHADOW ||
        // hydration only supports native shadow
        isTrue(hydrated)
    ) {
        return ShadowMode.Native;
    }

    const { isSyntheticShadowDefined } = renderer;

    let shadowMode;
    if (isSyntheticShadowDefined || lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE) {
        if (def.renderMode === RenderMode.Light) {
            // ShadowMode.Native implies "not synthetic shadow" which is consistent with how
            // everything defaults to native when the synthetic shadow polyfill is unavailable.
            shadowMode = ShadowMode.Native;
        } else if (def.shadowSupportMode === 'native') {
            shadowMode = ShadowMode.Native;
        } else {
            const shadowAncestor = getNearestShadowAncestor(owner);
            if (!isNull(shadowAncestor) && shadowAncestor.shadowMode === ShadowMode.Native) {
                // Transitive support for native Shadow DOM. A component in native mode
                // transitively opts all of its descendants into native.
                shadowMode = ShadowMode.Native;
            } else {
                // Synthetic if neither this component nor any of its ancestors are configured
                // to be native.
                shadowMode = ShadowMode.Synthetic;
            }
        }
    } else {
        // Native if the synthetic shadow polyfill is unavailable.
        shadowMode = ShadowMode.Native;
    }

    return shadowMode;
}

function assertIsVM(obj: unknown): asserts obj is VM {
    if (!isObject(obj) || isNull(obj) || !('renderRoot' in obj)) {
        throw new TypeError(`${obj} is not a VM.`);
    }
}

export function associateVM(obj: VMAssociable, vm: VM) {
    ViewModelReflection.set(obj, vm);
}

export function getAssociatedVM(obj: VMAssociable): VM {
    const vm = ViewModelReflection.get(obj);

    if (process.env.NODE_ENV !== 'production') {
        assertIsVM(vm);
    }

    return vm!;
}

export function getAssociatedVMIfPresent(obj: VMAssociable): VM | undefined {
    const maybeVm = ViewModelReflection.get(obj);

    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(maybeVm)) {
            assertIsVM(maybeVm);
        }
    }

    return maybeVm;
}

function rehydrate(vm: VM) {
    if (isTrue(vm.isDirty)) {
        const children = renderComponent(vm);
        patchShadowRoot(vm, children);
    }
}

function patchShadowRoot(vm: VM, newCh: VNodes) {
    const { renderRoot, children: oldCh, renderer } = vm;

    // reset the refs; they will be set during `patchChildren`
    resetRefVNodes(vm);

    // caching the new children collection
    vm.children = newCh;

    if (newCh.length > 0 || oldCh.length > 0) {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        if (oldCh !== newCh) {
            runWithBoundaryProtection(
                vm,
                vm,
                () => {
                    // pre
                    logOperationStart(OperationId.Patch, vm);
                },
                () => {
                    // job
                    patchChildren(oldCh, newCh, renderRoot, renderer);
                },
                () => {
                    // post
                    logOperationEnd(OperationId.Patch, vm);
                }
            );
        }
    }

    if (vm.state === VMState.connected) {
        // If the element is connected, that means connectedCallback was already issued, and
        // any successive rendering should finish with the call to renderedCallback, otherwise
        // the connectedCallback will take care of calling it in the right order at the end of
        // the current rehydration process.
        runRenderedCallback(vm);
    }
}

export function runRenderedCallback(vm: VM) {
    const {
        def: { renderedCallback },
    } = vm;

    if (!process.env.IS_BROWSER) {
        return;
    }

    if (!isUndefined(renderedCallback)) {
        logOperationStart(OperationId.RenderedCallback, vm);
        invokeComponentCallback(vm, renderedCallback);
        logOperationEnd(OperationId.RenderedCallback, vm);
    }
}

let rehydrateQueue: VM[] = [];

function flushRehydrationQueue() {
    // Gather the logs before rehydration starts so they can be reported at the end of rehydration.
    // Note that we also clear all existing logs at this point so that subsequent re-renders start from a clean slate.
    const mutationLogs =
        process.env.NODE_ENV === 'production' ? undefined : getAndFlushMutationLogs();

    logGlobalOperationStart(OperationId.GlobalRerender);

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            rehydrateQueue.length,
            `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`
        );
    }
    const vms = rehydrateQueue.sort((a: VM, b: VM): number => a.idx - b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        const vm = vms[i];
        try {
            // We want to prevent rehydration from occurring when nodes are detached from the DOM as this can trigger
            // unintended side effects, like lifecycle methods being called multiple times.
            // For backwards compatibility, we use a flag to control the check.
            // 1. When flag is off, always rehydrate (legacy behavior)
            // 2. When flag is on, only rehydrate when the VM state is connected (fixed behavior)
            if (!lwcRuntimeFlags.DISABLE_DETACHED_REHYDRATION || vm.state === VMState.connected) {
                rehydrate(vm);
            }
        } catch (error) {
            if (i + 1 < len) {
                // pieces of the queue are still pending to be rehydrated, those should have priority
                if (rehydrateQueue.length === 0) {
                    addCallbackToNextTick(flushRehydrationQueue);
                }
                rehydrateQueue.unshift(...vms.slice(i + 1));
            }
            // we need to end the measure before throwing.
            logGlobalOperationEnd(OperationId.GlobalRerender, mutationLogs);

            // re-throwing the original error will break the current tick, but since the next tick is
            // already scheduled, it should continue patching the rest.
            throw error;
        }
    }

    logGlobalOperationEnd(OperationId.GlobalRerender, mutationLogs);
}

export function runConnectedCallback(vm: VM) {
    const { state } = vm;
    if (state === VMState.connected) {
        return; // nothing to do since it was already connected
    }
    vm.state = VMState.connected;
    if (hasWireAdapters(vm)) {
        connectWireAdapters(vm);
    }

    if (lwcRuntimeFlags.ENABLE_EXPERIMENTAL_SIGNALS) {
        // Setup context before connected callback is executed
        connectContext(vm);
    }

    const { connectedCallback } = vm.def;
    if (!isUndefined(connectedCallback)) {
        logOperationStart(OperationId.ConnectedCallback, vm);

        if (!process.env.IS_BROWSER) {
            // Track host element mutations in SSR mode to add the `data-lwc-host-mutated` attribute if necessary
            vm.renderer.startTrackingMutations(vm.elm);
        }

        invokeComponentCallback(vm, connectedCallback);

        if (!process.env.IS_BROWSER) {
            vm.renderer.stopTrackingMutations(vm.elm);
        }

        logOperationEnd(OperationId.ConnectedCallback, vm);
    }
    // This test only makes sense in the browser, with synthetic lifecycle, and when reporting is enabled or
    // we're in dev mode. This is to detect a particular issue with synthetic lifecycle.
    if (
        process.env.IS_BROWSER &&
        lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE &&
        (process.env.NODE_ENV !== 'production' || isReportingEnabled())
    ) {
        if (!vm.renderer.isConnected(vm.elm)) {
            if (process.env.NODE_ENV !== 'production') {
                logWarnOnce(
                    `Element <${vm.tagName}> ` +
                        `fired a \`connectedCallback\` and rendered, but was not connected to the DOM. ` +
                        `Please ensure all components are actually connected to the DOM, e.g. using ` +
                        `\`document.body.appendChild(element)\`. This will not be supported in future versions of ` +
                        `LWC and could cause component errors. For details, see: https://sfdc.co/synthetic-lifecycle`
                );
            }
            report(ReportingEventId.ConnectedCallbackWhileDisconnected, {
                tagName: vm.tagName,
            });
        }
    }
}

function hasWireAdapters(vm: VM): boolean {
    return getOwnPropertyNames(vm.def.wire).length > 0;
}

function runDisconnectedCallback(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state !== VMState.disconnected, `${vm} must be inserted.`);
    }

    if (lwcRuntimeFlags.ENABLE_EXPERIMENTAL_SIGNALS) {
        disconnectContext(vm);
    }

    if (isFalse(vm.isDirty)) {
        // this guarantees that if the component is reused/reinserted,
        // it will be re-rendered because we are disconnecting the reactivity
        // linking, so mutations are not automatically reflected on the state
        // of disconnected components.
        vm.isDirty = true;
    }
    vm.state = VMState.disconnected;
    if (hasWireAdapters(vm)) {
        disconnectWireAdapters(vm);
    }
    const { disconnectedCallback } = vm.def;
    if (!isUndefined(disconnectedCallback)) {
        logOperationStart(OperationId.DisconnectedCallback, vm);

        invokeComponentCallback(vm, disconnectedCallback);

        logOperationEnd(OperationId.DisconnectedCallback, vm);
    }
}

function runChildNodesDisconnectedCallback(vm: VM) {
    const { velements: vCustomElementCollection } = vm;

    // Reporting disconnection for every child in inverse order since they are
    // inserted in reserved order.
    for (let i = vCustomElementCollection.length - 1; i >= 0; i -= 1) {
        const { elm } = vCustomElementCollection[i];

        // There are two cases where the element could be undefined:
        // * when there is an error during the construction phase, and an error
        //   boundary picks it, there is a possibility that the VCustomElement
        //   is not properly initialized, and therefore is should be ignored.
        // * when slotted custom element is not used by the element where it is
        //   slotted into it, as  a result, the custom element was never
        //   initialized.
        if (!isUndefined(elm)) {
            const childVM = getAssociatedVMIfPresent(elm);

            // The VM associated with the element might be associated undefined
            // in the case where the VM failed in the middle of its creation,
            // eg: constructor throwing before invoking super().
            if (!isUndefined(childVM)) {
                resetComponentStateWhenRemoved(childVM);
            }
        }
    }
}

function runLightChildNodesDisconnectedCallback(vm: VM) {
    const { aChildren: adoptedChildren } = vm;
    recursivelyDisconnectChildren(adoptedChildren);
}

/**
 * The recursion doesn't need to be a complete traversal of the vnode graph,
 * instead it can be partial, when a custom element vnode is found, we don't
 * need to continue into its children because by attempting to disconnect the
 * custom element itself will trigger the removal of anything slotted or anything
 * defined on its shadow.
 * @param vnodes
 */
function recursivelyDisconnectChildren(vnodes: VNodes) {
    for (let i = 0, len = vnodes.length; i < len; i += 1) {
        const vnode = vnodes[i];

        if (!isNull(vnode) && !isUndefined(vnode.elm)) {
            switch (vnode.type) {
                case VNodeType.Element:
                    recursivelyDisconnectChildren(vnode.children);
                    break;

                case VNodeType.CustomElement: {
                    const vm = getAssociatedVM(vnode.elm);
                    resetComponentStateWhenRemoved(vm);
                    break;
                }
            }
        }
    }
}

// This is a super optimized mechanism to remove the content of the root node (shadow root
// for shadow DOM components and the root element itself for light DOM) without having to go
// into snabbdom. Especially useful when the reset is a consequence of an error, in which case the
// children VNodes might not be representing the current state of the DOM.
export function resetComponentRoot(vm: VM) {
    recursivelyRemoveChildren(vm.children, vm);
    vm.children = EmptyArray;

    runChildNodesDisconnectedCallback(vm);
    vm.velements = EmptyArray;
}

// Helper function to remove all children of the root node.
// If the set of children includes VFragment nodes, we need to remove the children of those nodes too.
// Since VFragments can contain other VFragments, we need to traverse the entire of tree of VFragments.
// If the set contains no VFragment nodes, no traversal is needed.
function recursivelyRemoveChildren(vnodes: VNodes, vm: VM) {
    const {
        renderRoot,
        renderer: { remove },
    } = vm;

    for (let i = 0, len = vnodes.length; i < len; i += 1) {
        const vnode = vnodes[i];

        if (!isNull(vnode)) {
            // VFragments are special; their .elm property does not point to the root element since they have no single root.
            if (isVFragment(vnode)) {
                recursivelyRemoveChildren(vnode.children, vm);
            } else if (!isUndefined(vnode.elm)) {
                remove(vnode.elm, renderRoot);
            }
        }
    }
}

export function scheduleRehydration(vm: VM) {
    if (!process.env.IS_BROWSER || isTrue(vm.isScheduled)) {
        return;
    }

    vm.isScheduled = true;
    if (rehydrateQueue.length === 0) {
        addCallbackToNextTick(flushRehydrationQueue);
    }

    rehydrateQueue.push(vm);
}

function getErrorBoundaryVM(vm: VM): VM | undefined {
    let currentVm: VM | null = vm;

    while (!isNull(currentVm)) {
        if (!isUndefined(currentVm.def.errorCallback)) {
            return currentVm;
        }

        currentVm = currentVm.owner;
    }
}

export function runWithBoundaryProtection(
    vm: VM,
    owner: VM | null,
    pre: () => void,
    job: () => void,
    post: () => void
) {
    let error;

    pre();
    try {
        job();
    } catch (e) {
        error = Object(e);
    } finally {
        post();
        if (!isUndefined(error)) {
            addErrorComponentStack(vm, error);

            const errorBoundaryVm = isNull(owner) ? undefined : getErrorBoundaryVM(owner);
            // Error boundaries are not in effect when server-side rendering. `errorCallback`
            // is intended to allow recovery from errors - changing the state of a component
            // and instigating a re-render. That is at odds with the single-pass, synchronous
            // nature of SSR. For that reason, all errors bubble up to the `renderComponent`
            // call site.
            if (!process.env.IS_BROWSER || isUndefined(errorBoundaryVm)) {
                throw error; // eslint-disable-line no-unsafe-finally
            }
            resetComponentRoot(vm); // remove offenders

            logOperationStart(OperationId.ErrorCallback, vm);

            // error boundaries must have an ErrorCallback
            const errorCallback = errorBoundaryVm.def.errorCallback!;
            invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);

            logOperationEnd(OperationId.ErrorCallback, vm);
        }
    }
}

export function forceRehydration(vm: VM) {
    // if we must reset the shadowRoot content and render the template
    // from scratch on an active instance, the way to force the reset
    // is by replacing the value of old template, which is used during
    // to determine if the template has changed or not during the rendering
    // process. If the template returned by render() is different from the
    // previous stored template, the styles will be reset, along with the
    // content of the shadowRoot, this way we can guarantee that all children
    // elements will be throw away, and new instances will be created.
    vm.cmpTemplate = () => [];
    if (isFalse(vm.isDirty)) {
        // forcing the vm to rehydrate in the next tick
        markComponentAsDirty(vm);
        scheduleRehydration(vm);
    }
}

export function runFormAssociatedCustomElementCallback(vm: VM, faceCb: () => void, args?: any[]) {
    const {
        renderMode,
        shadowMode,
        def: { ctor },
    } = vm;

    if (
        shadowMode === ShadowMode.Synthetic &&
        renderMode !== RenderMode.Light &&
        !supportsSyntheticElementInternals(ctor)
    ) {
        throw new Error(
            'Form associated lifecycle methods are not available in synthetic shadow. Please use native shadow or light DOM.'
        );
    }

    invokeComponentCallback(vm, faceCb, args);
}

export function runFormAssociatedCallback(elm: HTMLElement, form: HTMLFormElement | null) {
    const vm = getAssociatedVM(elm);
    const { formAssociatedCallback } = vm.def;

    if (!isUndefined(formAssociatedCallback)) {
        runFormAssociatedCustomElementCallback(vm, formAssociatedCallback, [form]);
    }
}

export function runFormDisabledCallback(elm: HTMLElement, disabled: boolean) {
    const vm = getAssociatedVM(elm);
    const { formDisabledCallback } = vm.def;

    if (!isUndefined(formDisabledCallback)) {
        runFormAssociatedCustomElementCallback(vm, formDisabledCallback, [disabled]);
    }
}

export function runFormResetCallback(elm: HTMLElement) {
    const vm = getAssociatedVM(elm);
    const { formResetCallback } = vm.def;

    if (!isUndefined(formResetCallback)) {
        runFormAssociatedCustomElementCallback(vm, formResetCallback);
    }
}

// These types are inspired by https://github.com/material-components/material-web/blob/ffc08d1/labs/behaviors/form-associated.ts
export type FormRestoreState = File | string | Array<[string, FormDataEntryValue]>;

export type FormRestoreReason = 'restore' | 'autocomplete';

export function runFormStateRestoreCallback(
    elm: HTMLElement,
    state: FormRestoreState | null,
    reason: FormRestoreReason
) {
    const vm = getAssociatedVM(elm);
    const { formStateRestoreCallback } = vm.def;

    if (!isUndefined(formStateRestoreCallback)) {
        runFormAssociatedCustomElementCallback(vm, formStateRestoreCallback, [state, reason]);
    }
}

export function resetRefVNodes(vm: VM) {
    const { cmpTemplate } = vm;
    vm.refVNodes = !isNull(cmpTemplate) && cmpTemplate.hasRefs ? create(null) : null;
}
