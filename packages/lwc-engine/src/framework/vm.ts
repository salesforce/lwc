import assert from "./assert";
import { getComponentDef } from "./def";
import { createComponent, linkComponent, renderComponent, clearReactiveListeners, ComponentConstructor, ErrorCallback, markComponentAsDirty } from "./component";
import { patchChildren } from "./patch";
import { ArrayPush, isUndefined, isNull, ArrayUnshift, ArraySlice, create, isTrue, isFalse, isObject, keys } from "./language";
import { ViewModelReflection, addCallbackToNextTick, EmptyObject, EmptyArray, usesNativeSymbols } from "./utils";
import { invokeServiceHook, Services } from "./services";
import { invokeComponentCallback } from "./invoker";
import { parentNodeGetter, parentElementGetter } from "./dom/node";

import { VNodeData, VNodes } from "../3rdparty/snabbdom/types";
import { Template } from "./template";
import { ComponentDef } from "./def";
import { Component } from "./component";
import { Context } from "./context";
import { startMeasure, endMeasure } from "./performance-timing";
import { attachShadow, linkShadow, usesNativeShadowRoot } from "./dom/shadow-root";

export interface HashTable<T> {
    [key: string]: T;
}

export interface SlotSet {
    [key: string]: VNodes;
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
    cmpSlots: SlotSet;
    cmpTrack: HashTable<any>;
    cmpEvents?: Record<string, EventListener[] | undefined>;
    cmpListener?: (event: Event) => void;
    cmpTemplate?: Template;
    cmpRoot: ShadowRoot;
    callHook: (cmp: Component | undefined, fn: (...args: any[]) => any, args?: any[]) => any;
    setHook: (cmp: Component, prop: PropertyKey, newValue: any) => void;
    getHook: (cmp: Component, prop: PropertyKey) => any;
    isScheduled: boolean;
    isDirty: boolean;
    isRoot: boolean;
    fallback: boolean;
    mode: string;
    component?: Component;
    deps: VM[][];
    hostAttrs: Record<string, number | undefined>;
    toString(): string;
}

let idx: number = 0;
let uid: number = 0;

function callHook(cmp: Component | undefined, fn: (...args: any[]) => any, args?: any[]): any {
    return fn.apply(cmp, args);
}

function setHook(cmp: Component, prop: PropertyKey, newValue: any) {
    cmp[prop] = newValue;
}

function getHook(cmp: Component, prop: PropertyKey): any {
    return cmp[prop];
}

export const OwnerKey = usesNativeSymbols ? Symbol('key') : '$$OwnerKey$$';

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

export interface CreateOptions {
    mode: string;
    fallback: boolean;
    isRoot?: boolean;
}

export function createVM(tagName: string, elm: HTMLElement, Ctor: ComponentConstructor, options: CreateOptions) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element instead of ${elm}.`);
    }
    const def = getComponentDef(Ctor);
    const { isRoot, mode } = options;
    const fallback = isTrue(options.fallback) || isFalse(usesNativeShadowRoot);
    uid += 1;
    const vm: VM = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot: isTrue(isRoot),
        fallback,
        mode,
        def,
        elm: elm as VMElement,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        rootProps: create(null),
        cmpTrack: create(null),
        cmpState: undefined,
        cmpSlots: fallback ? create(null) : undefined,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpTemplate: undefined,
        cmpRoot: attachShadow(elm, options, fallback),
        callHook,
        setHook,
        getHook,
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
    // linking shadow-root with the VM before anything else.
    linkShadow(vm.cmpRoot, vm);
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
    const { cmpRoot, children: oldCh } = errorBoundaryVm;
    errorBoundaryVm.isScheduled = false;
    errorBoundaryVm.children = children; // caching the new children collection

    // patch function mutates vnodes by adding the element reference,
    // however, if patching fails it contains partial changes.
    // patch failures are caught in flushRehydrationQueue
    patchChildren(cmpRoot, oldCh, children);
    processPostPatchCallbacks(errorBoundaryVm);
}

function patchShadowRoot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { cmpRoot, children: oldCh } = vm;
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
        patchChildren(cmpRoot, oldCh, children);
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

function forceResetShadowContent(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const parentElm: ShadowRoot | Element = vm.fallback ? vm.elm : vm.cmpRoot;
    parentElm.innerHTML = "";
}

export function resetShadowRoot(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { cmpRoot, children: oldCh } = vm;
    vm.children = EmptyArray;
    if (oldCh.length === 0) {
        return; // optimization for the common case
    }

    try {
        // patch function mutates vnodes by adding the element reference,
        // however, if patching fails it contains partial changes.
        patchChildren(cmpRoot, oldCh, EmptyArray);
    } catch (e) {
        forceResetShadowContent(vm);
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
    const parentElm = elm && parentElementGetter.call(elm);
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
        elm = parentElementGetter.call(elm);
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
        elm = parentElementGetter.call(elm);
    } while (!isNull(elm));
    return wcStack.reverse().join('\n\t');
}

export function getElementOwnerVM(elm: Element | undefined): VM | undefined {
    if (!(elm instanceof Node)) {
        return;
    }
    let node: Node | null = elm;
    let ownerKey;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = node[OwnerKey]))) {
        node = parentNodeGetter.call(node);
    }
    if (isUndefined(ownerKey) || isNull(node)) {
        return;
    }
    let vm: VM | undefined;
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(node) && (isUndefined(vm = node[ViewModelReflection]) || (vm as VM).uid !== ownerKey)) {
        node = parentNodeGetter.call(node);
    }
    return isNull(node) ? undefined : vm;
}

export function getCustomElementVM(elmOrCmp: HTMLElement | Component | ShadowRoot): VM {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(elmOrCmp[ViewModelReflection]);
    }
    return elmOrCmp[ViewModelReflection] as VM;
}

export function getComponentVM(component: Component): VM {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(component[ViewModelReflection]);
    }
    return component[ViewModelReflection] as VM;
}

export function getShadowRootVM(root: ShadowRoot): VM {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(root[ViewModelReflection]);
    }
    return root[ViewModelReflection] as VM;
}

// slow path routine
export function allocateInSlot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(isObject(vm.cmpSlots), `When doing manual allocation, there must be a cmpSlots object available.`);
    }
    const { cmpSlots: oldSlots } = vm;
    const cmpSlots = vm.cmpSlots = create(null) as SlotSet;
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }
        const data = (vnode.data as VNodeData);
        const slotName = ((data.attrs && data.attrs.slot) || '') as string;
        const vnodes: VNodes = cmpSlots[slotName] = cmpSlots[slotName] || [];
        vnodes.push(vnode);
    }
    if (!vm.isDirty) {
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
