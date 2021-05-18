/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    ArraySlice,
    ArrayUnshift,
    assert,
    create,
    isArray,
    isFalse,
    isNull,
    isObject,
    isTrue,
    isUndefined,
    keys,
    createHiddenField,
    getHiddenField,
    setHiddenField,
    getOwnPropertyNames,
} from '@lwc/shared';

import {
    createComponent,
    renderComponent,
    markComponentAsDirty,
    getTemplateReactiveObserver,
} from './component';
import { addCallbackToNextTick, EmptyArray, EmptyObject } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback, invokeComponentRenderedCallback } from './invoker';

import { Template } from './template';
import { ComponentDef } from './def';
import { LightningElement } from './base-lightning-element';
import { startGlobalMeasure, endGlobalMeasure, GlobalMeasurementPhase } from './performance-timing';
import { logOperationStart, logOperationEnd, OperationId, trackProfilerState } from './profiler';
import { hasDynamicChildren } from './hooks';
import { ReactiveObserver } from './mutation-tracker';
import { connectWireAdapters, disconnectWireAdapters, installWireAdapters } from './wiring';
import { AccessorReactiveObserver } from './decorators/api';
import { Renderer, HostNode, HostElement } from './renderer';
import { removeActiveVM } from './hot-swaps';

import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';
import { VNodes, VCustomElement, VNode } from '../3rdparty/snabbdom/types';
import { addErrorComponentStack } from '../shared/error';

type ShadowRootMode = 'open' | 'closed';

export interface TemplateCache {
    [key: string]: any;
}

export interface SlotSet {
    [key: string]: VNodes;
}

export enum VMState {
    created,
    connected,
    disconnected,
}

export interface Context {
    /** The attribute name used on the host element to scope the style. */
    hostAttribute: string | undefined;
    /** The attribute name used on all the elements rendered in the shadow tree to scope the style. */
    shadowAttribute: string | undefined;
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
    readonly renderer: Renderer<N, E>;
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

let profilerEnabled = false;
trackProfilerState((t) => (profilerEnabled = t));

type VMAssociable = HostNode | LightningElement;

let idx: number = 0;

/** The internal slot used to associate different objects the engine manipulates with the VM */
const ViewModelReflection = createHiddenField<VM>('ViewModel', 'engine');

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

    startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);

    // Usually means moving the element from one place to another, which is observable via
    // life-cycle hooks.
    if (vm.state === VMState.connected) {
        disconnectRootElement(elm);
    }

    runConnectedCallback(vm);
    rehydrate(vm);

    endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
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
        const { oar, tro } = vm;
        // Making sure that any observing record will not trigger the rehydrated on this vm
        tro.reset();
        // Making sure that any observing accessor record will not trigger the setter to be reinvoked
        for (const key in oar) {
            oar[key].reset();
        }
        runDisconnectedCallback(vm);
        // Spec: https://dom.spec.whatwg.org/#concept-node-remove (step 14-15)
        runShadowChildNodesDisconnectedCallback(vm);
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

export function createVM<HostNode, HostElement>(
    elm: HostElement,
    def: ComponentDef,
    options: {
        mode: ShadowRootMode;
        owner: VM<HostNode, HostElement> | null;
        tagName: string;
        renderer: Renderer;
    }
): VM {
    const { mode, owner, renderer, tagName } = options;

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
        renderer,
        children: EmptyArray,
        aChildren: EmptyArray,
        velements: EmptyArray,
        cmpProps: create(null),
        cmpFields: create(null),
        cmpSlots: create(null),
        oar: create(null),
        cmpTemplate: null,

        context: {
            hostAttribute: undefined,
            shadowAttribute: undefined,
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

    vm.tro = getTemplateReactiveObserver(vm);

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }

    // Create component instance associated to the vm and the element.
    createComponent(vm, def.ctor);

    // Initializing the wire decorator per instance only when really needed
    if (isFalse(renderer.ssr) && hasWireAdapters(vm)) {
        installWireAdapters(vm);
    }

    return vm;
}

function assertIsVM(obj: any): asserts obj is VM {
    if (isNull(obj) || !isObject(obj) || !('cmpRoot' in obj)) {
        throw new TypeError(`${obj} is not a VM.`);
    }
}

export function associateVM(obj: VMAssociable, vm: VM) {
    setHiddenField(obj, ViewModelReflection, vm);
}

export function getAssociatedVM(obj: VMAssociable): VM {
    const vm = getHiddenField(obj, ViewModelReflection);

    if (process.env.NODE_ENV !== 'production') {
        assertIsVM(vm);
    }

    return vm!;
}

export function getAssociatedVMIfPresent(obj: VMAssociable): VM | undefined {
    const maybeVm = getHiddenField(obj, ViewModelReflection);

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
    const { cmpRoot, children: oldCh, elm } = vm;

    // caching the new children collection
    vm.children = newCh;

    if (newCh.length > 0 || oldCh.length > 0) {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        if (oldCh !== newCh) {
            const fn = hasDynamicChildren(newCh) ? updateDynamicChildren : updateStaticChildren;
            runWithBoundaryProtection(
                vm,
                vm,
                () => {
                    // pre
                    if (profilerEnabled) {
                        logOperationStart(OperationId.patch, vm);
                    }
                },
                () => {
                    // job
                    const elmentToRenderTo = hasShadow(vm) ? cmpRoot : elm;
                    fn(elmentToRenderTo, oldCh, newCh);
                },
                () => {
                    // post
                    if (profilerEnabled) {
                        logOperationEnd(OperationId.patch, vm);
                    }
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
    if (isTrue(vm.renderer.ssr)) {
        return;
    }

    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    invokeComponentRenderedCallback(vm);
}

let rehydrateQueue: VM[] = [];

function flushRehydrationQueue() {
    startGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);

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
            endGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);

            // re-throwing the original error will break the current tick, but since the next tick is
            // already scheduled, it should continue patching the rest.
            throw error; // eslint-disable-line no-unsafe-finally
        }
    }

    endGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);
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
        if (profilerEnabled) {
            logOperationStart(OperationId.connectedCallback, vm);
        }

        invokeComponentCallback(vm, connectedCallback);

        if (profilerEnabled) {
            logOperationEnd(OperationId.connectedCallback, vm);
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
        if (profilerEnabled) {
            logOperationStart(OperationId.disconnectedCallback, vm);
        }

        invokeComponentCallback(vm, disconnectedCallback);

        if (profilerEnabled) {
            logOperationEnd(OperationId.disconnectedCallback, vm);
        }
    }
}

function runShadowChildNodesDisconnectedCallback(vm: VM) {
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

// This is a super optimized mechanism to remove the content of the shadowRoot without having to go
// into snabbdom. Especially useful when the reset is a consequence of an error, in which case the
// children VNodes might not be representing the current state of the DOM.
export function resetShadowRoot(vm: VM) {
    if (!hasShadow(vm)) {
        return;
    }

    const { children, cmpRoot, renderer } = vm;

    for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];

        if (!isNull(child) && !isUndefined(child.elm)) {
            renderer.remove(child.elm, cmpRoot);
        }
    }
    vm.children = EmptyArray;

    runShadowChildNodesDisconnectedCallback(vm);
    vm.velements = EmptyArray;
}

export function scheduleRehydration(vm: VM) {
    if (isTrue(vm.renderer.ssr) || isTrue(vm.isScheduled)) {
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

// slow path routine
// NOTE: we should probably more this routine to the synthetic shadow folder
// and get the allocation to be cached by in the elm instead of in the VM
export function allocateInSlot(vm: VM, children: VNodes) {
    const { cmpSlots: oldSlots } = vm;
    const cmpSlots = (vm.cmpSlots = create(null));
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }
        const { data } = vnode;
        const slotName = ((data.attrs && data.attrs.slot) || '') as string;
        const vnodes: VNodes = (cmpSlots[slotName] = cmpSlots[slotName] || []);
        // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
        // which might have similar keys. Each vnode will always have a key that
        // starts with a numeric character from compiler. In this case, we add a unique
        // notation for slotted vnodes keys, e.g.: `@foo:1:1`
        if (!isUndefined(vnode.key)) {
            vnode.key = `@${slotName}:${vnode.key}`;
        }
        ArrayPush.call(vnodes, vnode);
    }
    if (isFalse(vm.isDirty)) {
        // We need to determine if the old allocation is really different from the new one
        // and mark the vm as dirty
        const oldKeys = keys(oldSlots);
        if (oldKeys.length !== keys(cmpSlots).length) {
            markComponentAsDirty(vm);
            return;
        }
        for (let i = 0, len = oldKeys.length; i < len; i += 1) {
            const key = oldKeys[i];
            if (isUndefined(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
                markComponentAsDirty(vm);
                return;
            }
            const oldVNodes = oldSlots[key];
            const vnodes = cmpSlots[key];
            for (let j = 0, a = cmpSlots[key].length; j < a; j += 1) {
                if (oldVNodes[j] !== vnodes[j]) {
                    markComponentAsDirty(vm);
                    return;
                }
            }
        }
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
            resetShadowRoot(vm); // remove offenders

            if (profilerEnabled) {
                logOperationStart(OperationId.errorCallback, vm);
            }

            // error boundaries must have an ErrorCallback
            const errorCallback = errorBoundaryVm.def.errorCallback!;
            invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);

            if (profilerEnabled) {
                logOperationEnd(OperationId.errorCallback, vm);
            }
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

export function hasShadow(vm: VM): vm is VM & { cmpRoot: ShadowRoot } {
    // We don't refer to vm.def.ctor.shadow because that could be changed by user
    // after instantiation.
    return !isNull(vm.cmpRoot);
}
