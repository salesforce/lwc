/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import {
    ArrayPush,
    ArraySlice,
    ArrayUnshift,
    assert,
    create,
    getOwnPropertyNames,
    isArray,
    isFalse,
    isNull,
    isObject,
    isTrue,
    isUndefined,
} from '@lwc/shared';
import { isSyntheticShadowDefined, ssr, remove, isNativeShadowDefined } from '../renderer';
import type { HostNode, HostElement } from '../renderer';
import { renderComponent, markComponentAsDirty, getTemplateReactiveObserver } from './component';
import { addCallbackToNextTick, EmptyArray, EmptyObject } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback, invokeComponentConstructor } from './invoker';
import { Template } from './template';
import { ComponentDef } from './def';
import { LightningElement } from './base-lightning-element';
import {
    logOperationStart,
    logOperationEnd,
    OperationId,
    logGlobalOperationEnd,
    logGlobalOperationStart,
} from './profiler';
import { hydrateChildrenHook, patchChildren } from './hooks';
import { ReactiveObserver } from './mutation-tracker';
import { connectWireAdapters, disconnectWireAdapters, installWireAdapters } from './wiring';
import { AccessorReactiveObserver } from './decorators/api';
import { removeActiveVM } from './hot-swaps';

import { VNodes, VCustomElement, VNode } from '../3rdparty/snabbdom/types';
import { addErrorComponentStack } from '../shared/error';

type ShadowRootMode = 'open' | 'closed';

export interface TemplateCache {
    [key: string]: any;
}

export interface SlotSet {
    [key: string]: VNodes;
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

export const enum ShadowSupportMode {
    Any = 'any',
    Default = 'reset',
}

export interface Context {
    /** The string used for synthetic shadow DOM and light DOM style scoping. */
    stylesheetToken: string | undefined;
    /** True if a stylesheetToken was added to the host class */
    hasTokenInClass: boolean | undefined;
    /** True if a stylesheetToken was added to the host attributes */
    hasTokenInAttribute: boolean | undefined;
    /** Whether or not light DOM scoped styles are present in the stylesheets. */
    hasScopedStyles: boolean | undefined;
    /** The VNode injected in all the shadow trees to apply the associated component stylesheets. */
    styleVNode: VNode | null;
    /** Object used by the template function to store information that can be reused between
     *  different render cycle of the same template. */
    tplCache: TemplateCache;
    /** List of wire hooks that are invoked when the component gets connected. */
    wiredConnecting: Array<() => void>;
    /** List of wire hooks that are invoked when the component gets disconnected. */
    wiredDisconnecting: Array<() => void>;
}

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
    /** Rendering operations associated with the VM */
    renderMode: RenderMode;
    shadowMode: ShadowMode;
    /** The component creation index. */
    idx: number;
    /** Component state, analogous to Element.isConnected */
    /** The component connection state. */
    state: VMState;
    /** The list of VNodes associated with the shadow tree. */
    children: VNodes;
    /** The list of adopted children VNodes. */
    aChildren: VNodes;
    /** The list of custom elements VNodes currently rendered in the shadow tree. We keep track of
     * those elements to efficiently unmount them when the parent component is disconnected without
     * having to traverse the VNode tree. */
    velements: VCustomElement[];
    /** The component public properties. */
    cmpProps: { [name: string]: any };
    /** The mapping between the slot names and the slotted VNodes. */
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
    cmpRoot: ShadowRoot | null;
    /** The template reactive observer. */
    tro: ReactiveObserver;
    /** The accessor reactive observers. Is only used when the ENABLE_REACTIVE_SETTER feature flag
     *  is enabled. */
    oar: { [name: string]: AccessorReactiveObserver };
    /** Hook invoked whenever a property is accessed on the host element. This hook is used by
     *  Locker only. */
    setHook: (cmp: LightningElement, prop: PropertyKey, newValue: any) => void;
    /** Hook invoked whenever a property is set on the host element. This hook is used by Locker
     *  only. */
    getHook: (cmp: LightningElement, prop: PropertyKey) => any;
    /** Hook invoked whenever a method is called on the component (life-cycle hooks, public
     *  properties and event handlers). This hook is used by Locker. */
    callHook: (cmp: LightningElement | undefined, fn: (...args: any[]) => any, args?: any[]) => any;
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

    logGlobalOperationStart(OperationId.GlobalHydrate, vm);

    // Usually means moving the element from one place to another, which is observable via
    // life-cycle hooks.
    if (vm.state === VMState.connected) {
        disconnectRootElement(elm);
    }

    runConnectedCallback(vm);
    rehydrate(vm);

    logGlobalOperationEnd(OperationId.GlobalHydrate, vm);
}

export function hydrateRootElement(elm: any) {
    const vm = getAssociatedVM(elm);

    runConnectedCallback(vm);
    hydrateVM(vm);
}

export function disconnectRootElement(elm: any) {
    const vm = getAssociatedVM(elm);
    resetComponentStateWhenRemoved(vm);
}

export function appendVM(vm: VM) {
    rehydrate(vm);
}

export function hydrateVM(vm: VM) {
    hydrate(vm);
}

// just in case the component comes back, with this we guarantee re-rendering it
// while preventing any attempt to rehydration until after reinsertion.
function resetComponentStateWhenRemoved(vm: VM) {
    const { state } = vm;

    if (state !== VMState.disconnected) {
        const { oar, tro } = vm;
        // Making sure that any observing record will not trigger the rehydrated on this vm
        tro.reset();
        // Making sure that any observing accessor record will not trigger the setter to be reinvoked
        for (const key in oar) {
            oar[key].reset();
        }
        runDisconnectedCallback(vm);
        // Spec: https://dom.spec.whatwg.org/#concept-node-remove (step 14-15)
        runChildNodesDisconnectedCallback(vm);
        runLightChildNodesDisconnectedCallback(vm);
    }

    if (process.env.NODE_ENV !== 'production') {
        removeActiveVM(vm);
    }
}

// this method is triggered by the diffing algo only when a vnode from the
// old vnode.children is removed from the DOM.
export function removeVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            vm.state === VMState.connected || vm.state === VMState.disconnected,
            `${vm} must have been connected.`
        );
    }
    resetComponentStateWhenRemoved(vm);
}

function getNearestShadowAncestor(vm: VM): VM | null {
    let ancestor = vm.owner;
    while (!isNull(ancestor) && ancestor.renderMode === RenderMode.Light) {
        ancestor = ancestor.owner;
    }
    return ancestor;
}

export function createVM<HostNode, HostElement>(
    elm: HostElement,
    def: ComponentDef,
    options: {
        mode: ShadowRootMode;
        owner: VM<HostNode, HostElement> | null;
        tagName: string;
    }
): VM {
    const { mode, owner, tagName } = options;

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
        children: EmptyArray,
        aChildren: EmptyArray,
        velements: EmptyArray,
        cmpProps: create(null),
        cmpFields: create(null),
        cmpSlots: create(null),
        oar: create(null),
        cmpTemplate: null,

        renderMode: def.renderMode,
        shadowMode: null!,

        context: {
            stylesheetToken: undefined,
            hasTokenInClass: undefined,
            hasTokenInAttribute: undefined,
            hasScopedStyles: undefined,
            styleVNode: null,
            tplCache: EmptyObject,
            wiredConnecting: EmptyArray,
            wiredDisconnecting: EmptyArray,
        },

        tro: null!, // Set synchronously after the VM creation.
        component: null!, // Set synchronously by the LightningElement constructor.
        cmpRoot: null!, // Set synchronously by the LightningElement constructor.

        callHook,
        setHook,
        getHook,
    };

    vm.shadowMode = computeShadowMode(vm);
    vm.tro = getTemplateReactiveObserver(vm);

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
        if (features.ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST) {
            vm.shadowMode = ShadowMode.Native;
        }
    }

    // Create component instance associated to the vm and the element.
    invokeComponentConstructor(vm, def.ctor);

    // Initializing the wire decorator per instance only when really needed
    if (hasWireAdapters(vm)) {
        installWireAdapters(vm);
    }

    return vm;
}

function computeShadowMode(vm: VM) {
    const { def } = vm;

    let shadowMode;
    if (isSyntheticShadowDefined) {
        if (def.renderMode === RenderMode.Light) {
            // ShadowMode.Native implies "not synthetic shadow" which is consistent with how
            // everything defaults to native when the synthetic shadow polyfill is unavailable.
            shadowMode = ShadowMode.Native;
        } else if (isNativeShadowDefined) {
            if (def.shadowSupportMode === ShadowSupportMode.Any) {
                shadowMode = ShadowMode.Native;
            } else {
                const shadowAncestor = getNearestShadowAncestor(vm);
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
            // Synthetic if there is no native Shadow DOM support.
            shadowMode = ShadowMode.Synthetic;
        }
    } else {
        // Native if the synthetic shadow polyfill is unavailable.
        shadowMode = ShadowMode.Native;
    }

    return shadowMode;
}

function assertIsVM(obj: any): asserts obj is VM {
    if (isNull(obj) || !isObject(obj) || !('cmpRoot' in obj)) {
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

function hydrate(vm: VM) {
    if (isTrue(vm.isDirty)) {
        // manually diffing/patching here.
        // This routine is:
        // patchShadowRoot(vm, children);
        //  -> addVnodes.
        const children = renderComponent(vm);
        vm.children = children;

        const vmChildren =
            vm.renderMode === RenderMode.Light ? vm.elm.childNodes : vm.elm.shadowRoot.childNodes;
        hydrateChildrenHook(vmChildren, children, vm);

        runRenderedCallback(vm);
    }
}

function patchShadowRoot(vm: VM, newCh: VNodes) {
    const { children: oldCh } = vm;

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
                    const renderRoot = getRenderRoot(vm);
                    patchChildren(renderRoot, oldCh, newCh);
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

function runRenderedCallback(vm: VM) {
    const {
        def: { renderedCallback },
    } = vm;

    if (isTrue(ssr)) {
        return;
    }

    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }

    if (!isUndefined(renderedCallback)) {
        logOperationStart(OperationId.RenderedCallback, vm);
        invokeComponentCallback(vm, renderedCallback);
        logOperationEnd(OperationId.RenderedCallback, vm);
    }
}

let rehydrateQueue: VM[] = [];

function flushRehydrationQueue() {
    logGlobalOperationStart(OperationId.GlobalRehydrate);

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
            rehydrate(vm);
        } catch (error) {
            if (i + 1 < len) {
                // pieces of the queue are still pending to be rehydrated, those should have priority
                if (rehydrateQueue.length === 0) {
                    addCallbackToNextTick(flushRehydrationQueue);
                }
                ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, i + 1));
            }
            // we need to end the measure before throwing.
            logGlobalOperationEnd(OperationId.GlobalRehydrate);

            // re-throwing the original error will break the current tick, but since the next tick is
            // already scheduled, it should continue patching the rest.
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }

    logGlobalOperationEnd(OperationId.GlobalRehydrate);
}

export function runConnectedCallback(vm: VM) {
    const { state } = vm;
    if (state === VMState.connected) {
        return; // nothing to do since it was already connected
    }
    vm.state = VMState.connected;
    // reporting connection
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
    }
    if (hasWireAdapters(vm)) {
        connectWireAdapters(vm);
    }
    const { connectedCallback } = vm.def;
    if (!isUndefined(connectedCallback)) {
        logOperationStart(OperationId.ConnectedCallback, vm);

        invokeComponentCallback(vm, connectedCallback);

        logOperationEnd(OperationId.ConnectedCallback, vm);
    }
}

function hasWireAdapters(vm: VM): boolean {
    return getOwnPropertyNames(vm.def.wire).length > 0;
}

function runDisconnectedCallback(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state !== VMState.disconnected, `${vm} must be inserted.`);
    }
    if (isFalse(vm.isDirty)) {
        // this guarantees that if the component is reused/reinserted,
        // it will be re-rendered because we are disconnecting the reactivity
        // linking, so mutations are not automatically reflected on the state
        // of disconnected components.
        vm.isDirty = true;
    }
    vm.state = VMState.disconnected;
    // reporting disconnection
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }
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
 */
function recursivelyDisconnectChildren(vnodes: VNodes) {
    for (let i = 0, len = vnodes.length; i < len; i += 1) {
        const vnode: VCustomElement | VNode | null = vnodes[i];
        if (!isNull(vnode) && isArray(vnode.children) && !isUndefined(vnode.elm)) {
            // vnode is a VElement with children
            if (isUndefined((vnode as any).ctor)) {
                // it is a VElement, just keep looking (recursively)
                recursivelyDisconnectChildren(vnode.children);
            } else {
                // it is a VCustomElement, disconnect it and ignore its children
                resetComponentStateWhenRemoved(getAssociatedVM(vnode.elm as HTMLElement));
            }
        }
    }
}

// This is a super optimized mechanism to remove the content of the root node (shadow root
// for shadow DOM components and the root element itself for light DOM) without having to go
// into snabbdom. Especially useful when the reset is a consequence of an error, in which case the
// children VNodes might not be representing the current state of the DOM.
export function resetComponentRoot(vm: VM) {
    const { children } = vm;
    const rootNode = getRenderRoot(vm);

    for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];

        if (!isNull(child) && !isUndefined(child.elm)) {
            remove(child.elm, rootNode);
        }
    }
    vm.children = EmptyArray;

    runChildNodesDisconnectedCallback(vm);
    vm.velements = EmptyArray;
}

export function scheduleRehydration(vm: VM) {
    if (isTrue(ssr) || isTrue(vm.isScheduled)) {
        return;
    }

    vm.isScheduled = true;
    if (rehydrateQueue.length === 0) {
        addCallbackToNextTick(flushRehydrationQueue);
    }

    ArrayPush.call(rehydrateQueue, vm);
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
            if (isUndefined(errorBoundaryVm)) {
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

export function getRenderRoot(vm: VM): ShadowRoot | HostElement {
    return vm.renderMode === RenderMode.Shadow ? vm.cmpRoot : vm.elm;
}
