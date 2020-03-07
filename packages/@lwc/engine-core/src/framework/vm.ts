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
    createHiddenField,
    getHiddenField,
    setHiddenField,
    getOwnPropertyNames,
} from '@lwc/shared';

import {
    createComponent,
    renderComponent,
    // markComponentAsDirty,
    getTemplateReactiveObserver,
} from './component';
import { addCallbackToNextTick, EmptyArray } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback, invokeComponentRenderedCallback } from './invoker';

import { Template, TemplateFactory } from './template';
import { ComponentDef } from './def';
import { ComponentInterface } from './component';
import {
    startMeasure,
    endMeasure,
    startGlobalMeasure,
    endGlobalMeasure,
    GlobalMeasurementPhase,
} from './performance-timing';
import { ReactiveObserver } from './mutation-tracker';
import { LightningElement } from './base-lightning-element';
import { connectWireAdapters, disconnectWireAdapters, installWireAdapters } from './wiring';
import { AccessorReactiveObserver } from './decorators/api';
import { Renderer, HostNode, HostElement } from './renderer';

import { addErrorComponentStack } from '../shared/error';

type ShadowRootMode = 'open' | 'closed';

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
    /** The component public properties. */
    cmpProps: { [name: string]: any };
    /** The component internal reactive properties. */
    cmpFields: { [name: string]: any };
    /** Flag indicating if the component has been scheduled for rerendering. */
    isScheduled: boolean;
    /** Flag indicating if the component internal should be scheduled for re-rendering. */
    isDirty: boolean;
    /** The shadow DOM mode. */
    mode: ShadowRootMode;
    /** The current template factory associated with the component. */
    cmpTemplateFactory: TemplateFactory | null;
    /** The current template associated with the component. */
    cmpTemplate: Template | null;
    /** The component instance. */
    component: ComponentInterface;
    /** The custom element shadow root. */
    cmpRoot: ShadowRoot;
    /** The template reactive observer. */
    tro: ReactiveObserver;
    /** The accessor reactive observers. Is only used when the ENABLE_REACTIVE_SETTER feature flag
     *  is enabled. */
    oar: { [name: string]: AccessorReactiveObserver };
    /** Hook invoked whenever a property is accessed on the host element. This hook is used by
     *  Locker only. */
    setHook: (cmp: ComponentInterface, prop: PropertyKey, newValue: any) => void;
    /** Hook invoked whenever a property is set on the host element. This hook is used by Locker
     *  only. */
    getHook: (cmp: ComponentInterface, prop: PropertyKey) => any;
    /** Hook invoked whenever a method is called on the component (life-cycle hooks, public
     *  properties and event handlers). This hook is used by Locker. */
    callHook: (
        cmp: ComponentInterface | undefined,
        fn: (...args: any[]) => any,
        args?: any[]
    ) => any;
}

type VMAssociable = HostNode | LightningElement | ComponentInterface;

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
        cmpProps: create(null),
        cmpFields: create(null),
        oar: create(null),
        cmpTemplate: null,
        cmpTemplateFactory: null,

        context: {
            hostAttribute: undefined,
            shadowAttribute: undefined,
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
        renderComponent(vm);
        patchShadowRoot(vm);
    }
}

function patchShadowRoot(vm: VM) {
    // const { cmpRoot, children: oldCh } = vm;

    // // caching the new children collection
    // vm.children = newCh;

    // if (newCh.length > 0 || oldCh.length > 0) {
    //     // patch function mutates vnodes by adding the element reference,
    //     // however, if patching fails it contains partial changes.
    //     if (oldCh !== newCh) {
    //         const fn = hasDynamicChildren(newCh) ? updateDynamicChildren : updateStaticChildren;
    //         runWithBoundaryProtection(
    //             vm,
    //             vm,
    //             () => {
    //                 // pre
    //                 if (process.env.NODE_ENV !== 'production') {
    //                     startMeasure('patch', vm);
    //                 }
    //             },
    //             () => {
    //                 // job
    //                 fn(cmpRoot, oldCh, newCh);
    //             },
    //             () => {
    //                 // post
    //                 if (process.env.NODE_ENV !== 'production') {
    //                     endMeasure('patch', vm);
    //                 }
    //             }
    //         );
    //     }
    // }

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
    // eslint-disable-next-line
    console.warn('TODO: runShadowChildNodesDisconnectedCallback');
}

function runLightChildNodesDisconnectedCallback(vm: VM) {
    // eslint-disable-next-line
    console.warn('TODO: runLightChildNodesDisconnectedCallback');
}

export function resetShadowRoot(vm: VM) {
    // eslint-disable-next-line
    console.warn('TODO: resetShadowRoot')
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
