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
import { getComponentInternalDef } from './def';
import {
    createComponent,
    renderComponent,
    ComponentConstructor,
    markComponentAsDirty,
} from './component';
import { addCallbackToNextTick, EmptyObject, EmptyArray, useSyntheticShadow } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback, invokeComponentRenderedCallback } from './invoker';
import { ShadowRootInnerHTMLSetter } from '../env/dom';

import { VNodeData, VNodes, VCustomElement, VNode } from '../3rdparty/snabbdom/types';
import { Template } from './template';
import { ComponentDef } from './def';
import { ComponentInterface } from './component';
import { Context } from './context';
import {
    startMeasure,
    endMeasure,
    startGlobalMeasure,
    endGlobalMeasure,
    GlobalMeasurementPhase,
} from './performance-timing';
import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';
import { hasDynamicChildren } from './hooks';
import { ReactiveObserver } from './mutation-tracker';
import { LightningElement } from './base-lightning-element';
import { getErrorComponentStack } from '../shared/format';
import { connectWireAdapters, disconnectWireAdapters, installWireAdapters } from './wiring';

export interface SlotSet {
    [key: string]: VNodes;
}

export enum VMState {
    created,
    connected,
    disconnected,
}

export interface UninitializedVM {
    /** Component Element Back-pointer */
    readonly elm: HTMLElement;
    /** Component Definition */
    readonly def: ComponentDef;
    /** Component Context Object */
    readonly context: Context;
    /** Back-pointer to the owner VM or null for root elements */
    readonly owner: VM | null;
    /** Component Creation Index */
    idx: number;
    /** Component state, analogous to Element.isConnected */
    state: VMState;
    data: VNodeData;
    /** Shadow Children List */
    children: VNodes;
    /** Adopted Children List */
    aChildren: VNodes;
    velements: VCustomElement[];
    cmpProps: Record<string, any>;
    cmpSlots: SlotSet;
    cmpFields: Record<string, any>;
    callHook: (
        cmp: ComponentInterface | undefined,
        fn: (...args: any[]) => any,
        args?: any[]
    ) => any;
    setHook: (cmp: ComponentInterface, prop: PropertyKey, newValue: any) => void;
    getHook: (cmp: ComponentInterface, prop: PropertyKey) => any;
    isScheduled: boolean;
    isDirty: boolean;
    isRoot: boolean;
    mode: 'open' | 'closed';
    toString(): string;

    // perf optimization to avoid reshaping the uninitialized when initialized
    cmpTemplate?: Template;
    component?: ComponentInterface;
    cmpRoot?: ShadowRoot;
    tro?: ReactiveObserver;
    oar?: Record<PropertyKey, ReactiveObserver>;
}

export interface VM extends UninitializedVM {
    cmpTemplate: Template;
    component: ComponentInterface;
    cmpRoot: ShadowRoot;
    /** Template Reactive Observer to observe values used by the selected template */
    tro: ReactiveObserver;
    /** Reactive Observers for each of the public @api accessors */
    oar: Record<PropertyKey, ReactiveObserver>;
}

type VMAssociable = Node | LightningElement | ComponentInterface;

let idx: number = 0;

/** The internal slot used to associate different objects the engine manipulates with the VM */
const ViewModelReflection = createHiddenField<VM>('ViewModel', 'engine');

function callHook(
    cmp: ComponentInterface | undefined,
    fn: (...args: any[]) => any,
    args: any[] = []
): any {
    return fn.apply(cmp, args);
}

function setHook(cmp: ComponentInterface, prop: PropertyKey, newValue: any) {
    (cmp as any)[prop] = newValue;
}

function getHook(cmp: ComponentInterface, prop: PropertyKey): any {
    return (cmp as any)[prop];
}

export function rerenderVM(vm: VM) {
    rehydrate(vm);
}

export function connectRootElement(elm: HTMLElement) {
    const vm = getAssociatedVM(elm);

    startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);

    // Usually means moving the element from one place to another, which is observable via
    // life-cycle hooks.
    if (vm.state === VMState.connected) {
        disconnectedRootElement(elm);
    }

    runConnectedCallback(vm);
    rehydrate(vm);

    endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
}

export function disconnectedRootElement(elm: HTMLElement) {
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

export function createVM(
    elm: HTMLElement,
    Ctor: ComponentConstructor,
    options: {
        mode: 'open' | 'closed';
        isRoot?: boolean;
        owner: VM | null;
    }
): VM {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            elm instanceof HTMLElement,
            `VM creation requires a DOM element instead of ${elm}.`
        );
    }
    const def = getComponentInternalDef(Ctor);
    const { isRoot, mode, owner } = options;
    idx += 1;
    const uninitializedVm: UninitializedVM = {
        // component creation index is defined once, and never reset, it can
        // be preserved from one insertion to another without any issue
        idx,
        state: VMState.created,
        isScheduled: false,
        isDirty: true,
        isRoot: isTrue(isRoot),
        mode,
        def,
        owner,
        elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpFields: create(null),
        cmpSlots: useSyntheticShadow ? create(null) : undefined,
        callHook,
        setHook,
        getHook,
        children: EmptyArray,
        aChildren: EmptyArray,
        velements: EmptyArray,
        // Perf optimization to preserve the shape of this obj
        cmpTemplate: undefined,
        component: undefined,
        cmpRoot: undefined,
        tro: undefined,
        oar: undefined,
    };

    if (process.env.NODE_ENV !== 'production') {
        uninitializedVm.toString = (): string => {
            return `[object:vm ${def.name} (${uninitializedVm.idx})]`;
        };
    }

    // create component instance associated to the vm and the element
    createComponent(uninitializedVm, Ctor);

    // link component to the wire service
    const initializedVm = uninitializedVm as VM;
    // initializing the wire decorator per instance only when really needed
    if (hasWireAdapters(initializedVm)) {
        installWireAdapters(initializedVm);
    }

    return initializedVm;
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            vm.elm instanceof HTMLElement,
            `rehydration can only happen after ${vm} was patched the first time.`
        );
    }
    if (isTrue(vm.isDirty)) {
        const children = renderComponent(vm);
        patchShadowRoot(vm, children);
    }
}

function patchShadowRoot(vm: VM, newCh: VNodes) {
    const { cmpRoot, children: oldCh } = vm;
    vm.children = newCh; // caching the new children collection
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
                    if (process.env.NODE_ENV !== 'production') {
                        startMeasure('patch', vm);
                    }
                },
                () => {
                    // job
                    fn(cmpRoot, oldCh, newCh);
                },
                () => {
                    // post
                    if (process.env.NODE_ENV !== 'production') {
                        endMeasure('patch', vm);
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
    const vms: VM[] = rehydrateQueue.sort((a: VM, b: VM): number => a.idx - b.idx);
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
        if (process.env.NODE_ENV !== 'production') {
            startMeasure('connectedCallback', vm);
        }

        invokeComponentCallback(vm, connectedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure('connectedCallback', vm);
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
        if (process.env.NODE_ENV !== 'production') {
            startMeasure('disconnectedCallback', vm);
        }

        invokeComponentCallback(vm, disconnectedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure('disconnectedCallback', vm);
        }
    }
}

function runShadowChildNodesDisconnectedCallback(vm: VM) {
    const { velements: vCustomElementCollection } = vm;
    // reporting disconnection for every child in inverse order since they are inserted in reserved order
    for (let i = vCustomElementCollection.length - 1; i >= 0; i -= 1) {
        const elm = vCustomElementCollection[i].elm;
        // There are two cases where the element could be undefined:
        // * when there is an error during the construction phase, and an
        //   error boundary picks it, there is a possibility that the VCustomElement
        //   is not properly initialized, and therefore is should be ignored.
        // * when slotted custom element is not used by the element where it is slotted
        //   into it, as a result, the custom element was never initialized.
        if (!isUndefined(elm)) {
            const childVM = getAssociatedVM(elm);
            resetComponentStateWhenRemoved(childVM);
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

// This is a super optimized mechanism to remove the content of the shadowRoot
// without having to go into snabbdom. Especially useful when the reset is a consequence
// of an error, in which case the children VNodes might not be representing the current
// state of the DOM
export function resetShadowRoot(vm: VM) {
    vm.children = EmptyArray;
    ShadowRootInnerHTMLSetter.call(vm.cmpRoot, '');
    // disconnecting any known custom element inside the shadow of the this vm
    runShadowChildNodesDisconnectedCallback(vm);
}

export function scheduleRehydration(vm: VM) {
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
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

/**
 * EXPERIMENTAL: This function detects whether or not a Node is
 * controlled by a LWC template. This API is subject to
 * change or being removed.
 */
export function isNodeFromTemplate(node: Node): boolean {
    if (isFalse(node instanceof Node)) {
        return false;
    }
    // TODO [#1250]: skipping the shadowRoot instances itself makes no sense, we need to revisit this with locker
    if (node instanceof ShadowRoot) {
        return false;
    }
    if (useSyntheticShadow) {
        // TODO [#1252]: old behavior that is still used by some pieces of the platform, specifically, nodes inserted
        // manually on places where `lwc:dom="manual"` directive is not used, will be considered global elements.
        if (isUndefined((node as any).$shadowResolver$)) {
            return false;
        }
    }
    const root = node.getRootNode();
    return root instanceof ShadowRoot;
}

// slow path routine
// NOTE: we should probably more this routine to the synthetic shadow folder
// and get the allocation to be cached by in the elm instead of in the VM
export function allocateInSlot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isObject(vm.cmpSlots),
            `When doing manual allocation, there must be a cmpSlots object available.`
        );
    }
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
        vnode.key = `@${slotName}:${vnode.key}`;
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
            error.wcStack = error.wcStack || getErrorComponentStack(vm);
            const errorBoundaryVm = isNull(owner) ? undefined : getErrorBoundaryVM(owner);
            if (isUndefined(errorBoundaryVm)) {
                throw error; // eslint-disable-line no-unsafe-finally
            }
            resetShadowRoot(vm); // remove offenders

            if (process.env.NODE_ENV !== 'production') {
                startMeasure('errorCallback', errorBoundaryVm);
            }

            // error boundaries must have an ErrorCallback
            const errorCallback = errorBoundaryVm.def.errorCallback!;
            invokeComponentCallback(errorBoundaryVm, errorCallback, [error, error.wcStack]);

            if (process.env.NODE_ENV !== 'production') {
                endMeasure('errorCallback', errorBoundaryVm);
            }
        }
    }
}
