/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from "../shared/assert";
import { getComponentDef } from "./def";
import { createComponent, linkComponent, renderComponent, clearReactiveListeners, ComponentConstructor, ErrorCallback, markComponentAsDirty } from "./component";
import { patchChildren } from "./patch";
import { ArrayPush, isUndefined, isNull, ArrayUnshift, ArraySlice, create, isTrue, isObject, keys, defineProperty, StringToLowerCase, isFalse } from "../shared/language";
import { getInternalField, getHiddenField } from "../shared/fields";
import { ViewModelReflection, addCallbackToNextTick, EmptyObject, EmptyArray } from "./utils";
import { invokeServiceHook, Services } from "./services";
import { invokeComponentCallback } from "./invoker";
import { ShadowRootInnerHTMLSetter, ShadowRootHostGetter } from "../env/dom";

import { VNodeData, VNodes } from "../3rdparty/snabbdom/types";
import { Template } from "./template";
import { ComponentDef } from "./def";
import { ComponentInterface } from "./component";
import { Context } from "./context";
import { startMeasure, endMeasure, startGlobalMeasure, endGlobalMeasure, GlobalMeasurementPhase } from "./performance-timing";
import { tagNameGetter, innerHTMLSetter } from "../env/element";
import { parentElementGetter, parentNodeGetter } from "../env/node";

// Object of type ShadowRoot for instance checks
const NativeShadowRoot = (window as any).ShadowRoot;
const isNativeShadowRootAvailable = typeof NativeShadowRoot !== "undefined";

export interface SlotSet {
    [key: string]: VNodes;
}

export interface UninitializedVM {
    readonly elm: HTMLElement;
    readonly def: ComponentDef;
    readonly context: Context;
    uid: number;
    idx: number;
    data: VNodeData;
    children: VNodes;
    cmpProps: any;
    cmpSlots: SlotSet;
    cmpTrack: any;
    cmpRoot: ShadowRoot;
    callHook: (cmp: ComponentInterface | undefined, fn: (...args: any[]) => any, args?: any[]) => any;
    setHook: (cmp: ComponentInterface, prop: PropertyKey, newValue: any) => void;
    getHook: (cmp: ComponentInterface, prop: PropertyKey) => any;
    isScheduled: boolean;
    isDirty: boolean;
    isRoot: boolean;
    fallback: boolean;
    mode: string;
    deps: VM[][];
    toString(): string;
}

export interface VM extends UninitializedVM {
    cmpState: Record<string, any>;
    cmpTemplate: Template;
    component: ComponentInterface;
}

let idx: number = 0;
let uid: number = 0;

function callHook(cmp: ComponentInterface | undefined, fn: (...args: any[]) => any, args: any[] = []): any {
    return fn.apply(cmp, args);
}

function setHook(cmp: ComponentInterface, prop: PropertyKey, newValue: any) {
    cmp[prop] = newValue;
}

function getHook(cmp: ComponentInterface, prop: PropertyKey): any {
    return cmp[prop];
}

// DO NOT CHANGE this:
// these two values are used by the faux-shadow implementation to traverse the DOM
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

function addInsertionIndex(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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

function removeInsertionIndex(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    if (vm.isDirty) {
        rehydrate(vm);
    }
}

export function appendVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    if (vm.idx !== 0) {
        return; // already appended
    }
    addInsertionIndex(vm);
}

export function removeVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
    resetShadowRoot(vm);
}

export interface CreateVMInit {
    mode: "open" | "closed";
    // custom settings for now
    fallback: boolean;
    isRoot?: boolean;
}

export function createVM(tagName: string, elm: HTMLElement, Ctor: ComponentConstructor, options: CreateVMInit) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element instead of ${elm}.`);
    }
    const def = getComponentDef(Ctor);
    const { isRoot, mode, fallback } = options;
    const shadowRootOptions: ShadowRootInit = {
        mode,
        delegatesFocus: !!Ctor.delegatesFocus,
    };
    uid += 1;
    const vm: UninitializedVM = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        isRoot: isTrue(isRoot),
        fallback,
        mode,
        def,
        elm: elm as HTMLElement,
        data: EmptyObject,
        context: create(null),
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpSlots: fallback ? create(null) : undefined,
        cmpRoot: elm.attachShadow(shadowRootOptions),
        callHook,
        setHook,
        getHook,
        children: EmptyArray,
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }
    // create component instance associated to the vm and the element
    createComponent(vm, Ctor);

    const initialized = vm as VM;
    // link component to the wire service
    linkComponent(initialized);
}

function rehydrate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(vm.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
    }
    if (vm.idx > 0 && vm.isDirty) {
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        processPostPatchCallbacks(vm);
    }
}

function patchErrorBoundaryVm(errorBoundaryVm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(errorBoundaryVm && "component" in errorBoundaryVm, `${errorBoundaryVm} is not a vm.`);
        assert.isTrue(errorBoundaryVm.elm instanceof HTMLElement, `rehydration can only happen after ${errorBoundaryVm} was patched the first time.`);
        assert.isTrue(errorBoundaryVm.isDirty, "rehydration recovery should only happen if vm has updated");
    }
    const children = renderComponent(errorBoundaryVm);
    const { elm, cmpRoot, fallback, children: oldCh } = errorBoundaryVm;
    errorBoundaryVm.isScheduled = false;
    errorBoundaryVm.children = children; // caching the new children collection

    // patch function mutates vnodes by adding the element reference,
    // however, if patching fails it contains partial changes.
    // patch failures are caught in flushRehydrationQueue
    patchChildren(elm, cmpRoot, oldCh, children, fallback);
    processPostPatchCallbacks(errorBoundaryVm);
}

function patchShadowRoot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    const { elm, cmpRoot, fallback, children: oldCh } = vm;
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
        patchChildren(elm, cmpRoot, oldCh, children, fallback);
    } catch (e) {
        error = Object(e);
    } finally {
        if (process.env.NODE_ENV !== 'production') {
            endMeasure(vm, 'patch');
        }

        if (!isUndefined(error)) {
            const errorBoundaryVm = getErrorBoundaryVMFromOwnElement(vm);
            if (isUndefined(errorBoundaryVm)) {
                throw error; // eslint-disable-line no-unsafe-finally
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
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
    startGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);

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
                // we need to end the measure before throwing.
                endGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);

                // rethrowing the original error will break the current tick, but since the next tick is
                // already scheduled, it should continue patching the rest.
                throw error;
            }
            // we only recover if error boundary is present in the hierarchy
            recoverFromLifeCycleError(vm, errorBoundaryVm, error);
            if (errorBoundaryVm.isDirty) {
                patchErrorBoundaryVm(errorBoundaryVm);
            }
        }
    }

    endGlobalMeasure(GlobalMeasurementPhase.REHYDRATE);
}

function recoverFromLifeCycleError(failedVm: VM, errorBoundaryVm: VM, error: any) {
    if (isUndefined(error.wcStack)) {
        error.wcStack = getErrorComponentStack(failedVm.elm);
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

function destroyChildren(children: VNodes) {
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }
        const { elm } = vnode;
        if (isUndefined(elm)) {
            continue;
        }
        try {
            // if destroy fails, it really means that the service hook or disconnect hook failed,
            // we should just log the issue and continue our destroying procedure
            vnode.hook.destroy(vnode);
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                const vm = getCustomElementVM(elm as HTMLElement);
                assert.logError(`Internal Error: Failed to disconnect component ${vm}. ${e}`, elm as Element);
            }
        }
    }
}

// This is a super optimized mechanism to remove the content of the shadowRoot
// without having to go into snabbdom. Especially useful when the reset is a consequence
// of an error, in which case the children VNodes might not be representing the current
// state of the DOM
export function resetShadowRoot(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    const { children: oldCh, fallback } = vm;
    vm.children = EmptyArray;
    if (isTrue(fallback)) {
        // faux-shadow does not have a real cmpRoot instance, instead
        // we need to remove the content of the host entirely
        innerHTMLSetter.call(vm.elm, '');
    } else {
        ShadowRootInnerHTMLSetter.call(vm.cmpRoot, '');
    }
    // proper destroying mechanism for those vnodes that requires it
    destroyChildren(oldCh);
}

export function scheduleRehydration(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}

function getErrorBoundaryVMFromParentElement(vm: VM): VM | undefined {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    const { elm } = vm;
    const parentElm = elm && getParentOrHostElement(elm);
    return getErrorBoundaryVM(parentElm);
}

function getErrorBoundaryVMFromOwnElement(vm: VM): VM | undefined {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    const { elm } = vm;
    return getErrorBoundaryVM(elm);
}

function getErrorBoundaryVM(startingElement: Element | null): VM | undefined {
    let elm: Element | null = startingElement;
    let vm: VM | undefined;

    while (!isNull(elm)) {
        vm = getInternalField(elm, ViewModelReflection);
        if (!isUndefined(vm) && !isUndefined(vm.def.errorCallback)) {
            return vm;
        }
        elm = getParentOrHostElement(elm);
    }
}

/**
 * Returns the component stack. Used for errors messages only.
 *
 * @param {Element} startingElement
 *
 * @return {string} The component stack for errors.
 */
export function getErrorComponentStack(startingElement: Element): string {
    const wcStack: string[] = [];
    let elm: Element | null = startingElement;
    do {
        const currentVm: VM | undefined = getInternalField(elm, ViewModelReflection);
        if (!isUndefined(currentVm)) {
            const tagName = tagNameGetter.call(elm);
            const is = elm.getAttribute('is');
            ArrayPush.call(wcStack, `<${StringToLowerCase.call(tagName)}${ is ? ' is="${is}' : '' }>`);
        }
        elm = getParentOrHostElement(elm);
    } while (!isNull(elm));
    return wcStack.reverse().join('\n\t');
}

/**
 * Finds the parent of the specified element. If shadow DOM is enabled, finds
 * the host of the shadow root to escape the shadow boundary.
 */
function getParentOrHostElement(elm: Element): Element | null {
    const parentElement = parentElementGetter.call(elm);
    // If this is a shadow root, find the host instead
    return (isNull(parentElement) && isNativeShadowRootAvailable) ? getHostElement(elm) : parentElement;
}

/**
 * Finds the host element, if it exists.
 */
function getHostElement(elm: Element): Element | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isNativeShadowRootAvailable, 'getHostElement should only be called if native shadow root is available');
        assert.isTrue(isNull(parentElementGetter.call(elm)), `getHostElement should only be called if the parent element of ${elm} is null`);
    }
    const parentNode = parentNodeGetter.call(elm);
    return parentNode instanceof NativeShadowRoot
        ? ShadowRootHostGetter.call(parentNode as unknown)
        : null;
}

export function isNodeFromTemplate(node: Node): boolean {
    if (isFalse(node instanceof Node)) {
        return false;
    }
    return !isUndefined(getNodeOwnerKey(node));
}

export function getNodeOwnerKey(node: Node): number | undefined {
    return node[OwnerKey];
}

export function setNodeOwnerKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the owner key
        defineProperty(node, OwnerKey, {
            value,
            enumerable: true,
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnerKey] = value;
    }
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}

export function setNodeKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the own key
        defineProperty(node, OwnKey, {
            value,
            enumerable: true,
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnKey] = value;
    }
}

export function getShadowRootHost(sr: ShadowRoot): HTMLElement | null {
    const vm: VM | undefined = getInternalField(sr, ViewModelReflection);
    if (isUndefined(vm)) {
        return null;
    }
    return vm.elm;
}

export function getCustomElementVM(elm: HTMLElement): VM {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(elm, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    return getInternalField(elm, ViewModelReflection) as VM;
}

export function getComponentVM(component: ComponentInterface): VM {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getHiddenField(component, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    return getHiddenField(component, ViewModelReflection) as VM;
}

export function getShadowRootVM(root: ShadowRoot): VM {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(root, ViewModelReflection);
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
    }
    return getInternalField(root, ViewModelReflection) as VM;
}

// slow path routine
// NOTE: we should probably more this routine to the faux shadow folder
// and get the allocation to be cached by in the elm instead of in the VM
export function allocateInSlot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
        // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
        // which might have similar keys. Each vnode will always have a key that
        // starts with a numeric character from compiler. In this case, we add a unique
        // notation for slotted vnodes keys, e.g.: `@foo:1:1`
        vnode.key = `@${slotName}:${vnode.key}`;
        ArrayPush.call(vnodes, vnode);
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
