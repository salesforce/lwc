import assert from "./assert";
import { getComponentDef } from "./def";
import { createComponent, linkComponent, renderComponent, clearReactiveListeners, ComponentConstructor, ErrorCallback } from "./component";
import { patchChildren } from "./patch";
import { ArrayPush, isUndefined, isNull, ArrayUnshift, ArraySlice, create, hasOwnProperty } from "./language";
import { addCallbackToNextTick, EmptyObject, EmptyArray, usesNativeSymbols } from "./utils";
import { ViewModelReflection, getCtorByTagName } from "./def";
import { invokeServiceHook, Services } from "./services";
import { invokeComponentCallback } from "./invoker";

import { VNode, VNodeData, VNodes } from "../3rdparty/snabbdom/types";
import { Template } from "./template";
import { ComponentDef } from "./def";
import { Membrane } from "./membrane";
import { Component } from "./component";
import { Context } from "./context";
import { ShadowRoot } from "./root";
import { startMeasure, endMeasure } from "./performance-timing";
import { NoArgumentListener, WIRE_CONTEXT_ID, CONTEXT_CONNECTED, CONTEXT_DISCONNECTED } from "./wiring";

export interface HashTable<T> {
    [key: string]: T;
}

export interface Slotset {
    [key: string]: VNode[];
}

export interface VMElement extends HTMLElement {
    [ViewModelReflection]: VM;
}

export interface VM {
    readonly elm: VMElement;
    readonly def: ComponentDef;
    readonly context: Context;
    uid: number;
    idx: number;
    data: VNodeData;
    children: VNodes;
    cmpProps: HashTable<any>;
    // TODO: make this type more restrictive once we know more about it
    rootProps: Record<string, string | null | boolean>;
    cmpState?: HashTable<any>;
    cmpSlots?: Slotset;
    cmpTrack: HashTable<any>;
    cmpEvents?: Record<string, EventListener[] | undefined>;
    cmpListener?: (event: Event) => void;
    cmpTemplate?: Template;
    cmpRoot?: ShadowRoot;
    render?: () => void | Template;
    isScheduled: boolean;
    isDirty: boolean;
    isRoot: boolean;
    component?: Component;
    membrane?: Membrane;
    deps: VM[][];
    hostAttrs: Record<string, number | undefined>;
    toString(): string;
    wireValues?: HashTable<any>;
}

let idx: number = 0;
let uid: number = 0;

export const OwnerKey = usesNativeSymbols ? Symbol('key') : '$$OwnerKey$$';

/**
 * Invokes the specified callbacks.
 * @param listeners functions to call
 */
function invokeListener(listeners: NoArgumentListener[]) {
    for (let i = 0, len = listeners.length; i < len; ++i) {
        listeners[i].call(undefined);
    }
}

export function addInsertionIndex(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(vm.idx === 0, `${vm} is already locked to a previously generated idx.`);
    }
    vm.idx = ++idx;
    const { connected } = Services;
    if (connected) {
        invokeServiceHook(vm, connected);
    }

    if (vm.def.wire && vm.context[WIRE_CONTEXT_ID]) {
        invokeListener(vm.context[WIRE_CONTEXT_ID][CONTEXT_CONNECTED]);
    }

    const { connectedCallback } = vm.def;
    if (!isUndefined(connectedCallback)) {
        if (process.env.NODE_ENV !== 'production') {
            startMeasure(vm, 'connectedCallback');
        }

        invokeComponentCallback(vm, connectedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'connectedCallback');
        }
    }
}

export function removeInsertionIndex(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(vm.idx > 0, `${vm} is not locked to a previously generated idx.`);
    }
    vm.idx = 0;
    const { disconnected } = Services;
    if (disconnected) {
        invokeServiceHook(vm, disconnected);
    }

    if (vm.def.wire && vm.context[WIRE_CONTEXT_ID]) {
        invokeListener(vm.context[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED]);
    }

    const { disconnectedCallback } = vm.def;
    if (!isUndefined(disconnectedCallback)) {
        if (process.env.NODE_ENV !== 'production') {
            startMeasure(vm, 'disconnectedCallback');
        }

        invokeComponentCallback(vm, disconnectedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'disconnectedCallback');
        }
    }
}

export function renderVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (vm.isDirty) {
        rehydrate(vm);
    }
}

export function appendVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (vm.idx !== 0) {
        return; // already appended
    }
    addInsertionIndex(vm);
}

export function removeVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (vm.idx === 0) {
        return; // already removed
    }
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    clearReactiveListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use Custom Element APIs, we can remove this
    // because the disconnectedCallback will be triggered automatically when
    // removed from the DOM.
    patchShadowRoot(vm, []);
}

export function createVM(tagName: string, elm: HTMLElement, cmpSlots?: Slotset) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element instead of ${elm}.`);
    }
    if (hasOwnProperty.call(elm, ViewModelReflection)) {
        return; // already created
    }
    const Ctor = getCtorByTagName(tagName) as ComponentConstructor;
    const def = getComponentDef(Ctor);
    const isRoot = arguments.length === 2; // root elements can't provide slotset
    uid += 1;
    const vm: VM = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot,
        def,
        elm: elm as VMElement,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        rootProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        component: undefined,
        children: EmptyArray,
        hostAttrs: create(null),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }
    createComponent(vm, Ctor);
    linkComponent(vm);
}

export function rehydrate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isTrue(vm.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
    }
    if (vm.idx > 0 && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}

export function patchErrorBoundaryVm(errorBoundaryVm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(errorBoundaryVm);
        assert.isTrue(errorBoundaryVm.elm instanceof HTMLElement, `rehydration can only happen after ${errorBoundaryVm} was patched the first time.`);
        assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
    }
    const children = renderComponent(errorBoundaryVm);
    const { elm, children: oldCh } = errorBoundaryVm;
    errorBoundaryVm.isScheduled = false;
    errorBoundaryVm.children = children; // caching the new children collection

    // patch function mutates vnodes by adding the element reference,
    // however, if patching fails it contains partial changes.
    // patch failures are caught in flushRehydrationQueue
    patchChildren(elm, oldCh, children);
    processPostPatchCallbacks(errorBoundaryVm);
}

function patchShadowRoot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { children: oldCh } = vm;
    vm.children = children; // caching the new children collection
    if (children.length === 0 && oldCh.length === 0) {
        return; // nothing to do here
    }
    let error;

    if (process.env.NODE_ENV !== 'production') {
        startMeasure(vm, 'patch');
    }

    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(vm.elm, oldCh, children);
    } catch (e) {
        error = Object(e);
    } finally {
        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'patch');
        }

        if (!isUndefined(error)) {
            const errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);
            if (isUndefined(errorBoundaryVm)) {
                throw error; // tslint:disable-line
            }
            recoverFromLifeCycleError(vm, errorBoundaryVm, error);

            // synchronously render error boundary's alternative view
            // to recover in the same tick
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }
}

function processPostPatchCallbacks(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    const { renderedCallback } = vm.def;
    if (!isUndefined(renderedCallback)) {
        if (process.env.NODE_ENV !== 'production') {
            startMeasure(vm, 'renderedCallback');
        }

        invokeComponentCallback(vm, renderedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'renderedCallback');
        }
    }
}

let rehydrateQueue: VM[] = [];

function flushRehydrationQueue() {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    }
    const vms: VM[] = rehydrateQueue.sort((a: VM, b: VM): number => a.idx - b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        const vm = vms[i];
        try {
            rehydrate(vm);
        } catch (error) {
            const errorBoundaryVm = getErrorBoundaryVMFromParentElement(vm);
            if (isUndefined(errorBoundaryVm)) {
                if (i + 1 < len) {
                    // pieces of the queue are still pending to be rehydrated, those should have priority
                    if (rehydrateQueue.length === 0) {
                        addCallbackToNextTick(flushRehydrationQueue);
                    }
                    ArrayUnshift.apply(rehydrateQueue, ArraySlice.call(vms, i + 1));
                }
                // rethrowing the original error will break the current tick, but since the next tick is
                // already scheduled, it should continue patching the rest.
                throw error; // tslint:disable-line
            }
            // we only recover if error boundary is present in the hierarchy
            recoverFromLifeCycleError(vm, errorBoundaryVm, error);
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }
}

function recoverFromLifeCycleError(failedVm: VM, errorBoundaryVm: VM, error: any) {
    if (isUndefined(error.wcStack)) {
        error.wcStack = getComponentStack(failedVm);
    }
    resetShadowRoot(failedVm); // remove offenders
    const { errorCallback } = errorBoundaryVm.def;

    if (process.env.NODE_ENV !== 'production') {
        startMeasure(errorBoundaryVm, 'errorCallback');
    }

    // error boundaries must have an ErrorCallback
    invokeComponentCallback(errorBoundaryVm, errorCallback as ErrorCallback, [error, error.wcStack]);

    if (process.env.NODE_ENV !== 'production') {
        endMeasure(errorBoundaryVm, 'errorCallback');
    }
}

export function resetShadowRoot(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { elm, children: oldCh } = vm;
    vm.children = EmptyArray;
    if (oldCh.length === 0) {
        return; // optimization for the common case
    }

    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(elm, oldCh, EmptyArray);
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            assert.logError("Swallow Error: Failed to reset component's shadow with an empty list of children: " + e);
        }
        // in the event of patch failure force offender removal
        vm.elm.innerHTML = "";
    }
}

export function scheduleRehydration(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}

export function isNodeOwnedByVM(vm: VM, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(node instanceof Node, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
        assert.childNode(vm.elm, node, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${vm}`);
    }
    return node[OwnerKey] === vm.uid;
}

export function wasNodePassedIntoVM(vm: VM, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(node instanceof Node, `isNodePassedToVM() should be called with a node as the second argument instead of ${node}`);
        assert.childNode(vm.elm, node, `isNodePassedToVM() should never be called with a node that is not a child node of ${vm}`);
    }
    const { elm } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    return node[OwnerKey] === elm[OwnerKey];
}

function getErrorBoundaryVMFromParentElement(vm: VM): VM | undefined {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { elm } = vm;
    const parentElm = elm && elm.parentElement;
    return getErrorBoundaryVM(parentElm);
}

function getErrorBoundaryVMFromOwnElement(vm: VM): VM | undefined {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { elm } = vm;
    return getErrorBoundaryVM(elm);
}

function getErrorBoundaryVM(startingElement: Element | null): VM | undefined {
    let elm: Element | null = startingElement;
    let vm: VM;

    while (!isNull(elm)) {
        vm = elm[ViewModelReflection];
        if (!isUndefined(vm) && !isUndefined(vm.def.errorCallback)) {
            return vm;
        }
        // TODO: if shadowDOM start preventing this walking process, we will
        // need to find a different way to find the right boundary
        elm = elm.parentElement;
    }
}

export function getComponentStack(vm: VM): string {
    const wcStack: string[] = [];
    let elm: HTMLElement | null = vm.elm;
    do {
        const currentVm: VM | undefined = elm[ViewModelReflection];
        if (!isUndefined(currentVm)) {
            ArrayPush.call(wcStack, (currentVm.component as Component).toString());
        }
        elm = elm.parentElement;
    } while (!isNull(elm));
    return wcStack.reverse().join('\n\t');
}
