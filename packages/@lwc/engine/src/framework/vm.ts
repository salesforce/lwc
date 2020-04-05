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
    isFalse,
    isNull,
    isObject,
    isTrue,
    isUndefined,
    keys,
    createHiddenField,
    getHiddenField,
    setHiddenField,
} from '@lwc/shared';
import { createComponent, linkComponent, renderComponent, markComponentAsDirty } from './component';
import { addCallbackToNextTick, EmptyObject, EmptyArray, useSyntheticShadow } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback, invokeComponentRenderedCallback } from './invoker';

import { VNodeData, VNodes } from '../3rdparty/snabbdom/types';
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
import { ReactiveObserver } from '../libs/mutation-tracker';
import { LightningElement } from './base-lightning-element';
import { getErrorComponentStack } from '../shared/format';

export interface SlotSet {
    [key: string]: VNodes;
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
    data: VNodeData;
    /** Shadow Children List */
    children: VNodes;
    cmpProps: any;
    cmpSlots: SlotSet;
    cmpTrack: any;
    callHook: (
        cmp: ComponentInterface | undefined,
        fn: (...args: any[]) => any,
        args?: any[]
    ) => any;
    setHook: (cmp: ComponentInterface, prop: PropertyKey, newValue: any) => void;
    getHook: (cmp: ComponentInterface, prop: PropertyKey) => any;
    isScheduled: boolean;
    isDirty: boolean;
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

type VMAssociable = ShadowRoot | LightningElement | ComponentInterface;

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

// just in case the component comes back, with this we guarantee re-rendering it
// while preventing any attempt to rehydration until after reinsertion.
function resetReactiveListeners(vm: VM) {
    const { oar, tro } = vm;
    // Making sure that any observing record will not trigger the rehydration on this vm
    tro.reset();
    // Making sure that any observing accessor record will not trigger the setter to be reinvoked
    for (const key in oar) {
        oar[key].reset();
    }
    // this guarantees that if the component is reused/reinserted, it will be re-rendered.
    // it should be re-rendered because we are disconnecting the reactivity
    // linking, so mutations are not automatically reflected on the state
    // of disconnected components.
    vm.isDirty = true;
}

export function renderVM(vm: VM) {
    rehydrate(vm);
}

export function appendVM(vm: VM) {
    runConnectedCallback(vm);
}

// this method is triggered by the removal of a element from the DOM.
export function removeVM(vm: VM) {
    resetReactiveListeners(vm);
    runDisconnectedCallback(vm);
}

export interface CreateVMInit {
    mode: 'open' | 'closed';
    // custom settings for now
    owner: VM | null;
}

export function createVM(elm: HTMLElement, def: ComponentDef, options: CreateVMInit) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            elm instanceof HTMLElement,
            `VM creation requires a DOM element instead of ${elm}.`
        );
    }
    const { mode, owner } = options;
    idx += 1;
    const uninitializedVm: UninitializedVM = {
        // component creation index is defined once, and never reset, it can
        // be preserved from one insertion to another without any issue
        idx,
        isScheduled: false,
        isDirty: true,
        mode,
        def,
        owner,
        elm,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpSlots: useSyntheticShadow ? create(null) : undefined,
        callHook,
        setHook,
        getHook,
        children: EmptyArray,
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
    createComponent(uninitializedVm, def.ctor);

    // link component to the wire service
    const initializedVm = uninitializedVm as VM;
    linkComponent(initializedVm);
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
    runRenderedCallback(vm);
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

function runConnectedCallback(vm: VM) {
    // reporting connection
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
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

function runDisconnectedCallback(vm: VM) {
    // reporting disconnection
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
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

// For error boundary recovery, some vnodes might not have the `elm` defined, and there is no guarantee
// that it was inserted. This routine just attempts to remove all possible nodes by ignoring errors.
function resetShadowRootAfterError(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    const { children, cmpRoot } = vm;
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (!isNull(vnode)) {
            const { elm } = vnode;
            if (!isUndefined(elm)) {
                // the concern here is that this routine might
                // throw and we have one flow that does not
                // have protection (recovering from error boundary)
                try {
                    cmpRoot.removeChild(elm);
                } catch (e) {
                    // ignore any error to complete the clean up
                }
            }
        }
    }
    vm.children = EmptyArray;
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
            resetShadowRootAfterError(vm); // remove offenders

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
