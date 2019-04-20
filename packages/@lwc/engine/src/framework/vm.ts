/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { getComponentDef } from './def';
import {
    createComponent,
    linkComponent,
    renderComponent,
    clearReactiveListeners,
    ComponentConstructor,
    markComponentAsDirty,
} from './component';
import { hasDynamicChildren } from './patch';
import {
    ArrayPush,
    isUndefined,
    isNull,
    ArrayUnshift,
    ArraySlice,
    create,
    isTrue,
    isObject,
    keys,
    defineProperty,
    StringToLowerCase,
    isFalse,
} from '../shared/language';
import { getInternalField, getHiddenField } from '../shared/fields';
import { ViewModelReflection, addCallbackToNextTick, EmptyObject, EmptyArray } from './utils';
import { invokeServiceHook, Services } from './services';
import { invokeComponentCallback } from './invoker';
import { ShadowRootInnerHTMLSetter, ShadowRootHostGetter } from '../env/dom';

import { VNodeData, VNodes, VCustomElement } from '../3rdparty/snabbdom/types';
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
import { tagNameGetter, innerHTMLSetter } from '../env/element';
import { parentElementGetter, parentNodeGetter } from '../env/node';
import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';

// Object of type ShadowRoot for instance checks
const NativeShadowRoot = (window as any).ShadowRoot;
const isNativeShadowRootAvailable = typeof NativeShadowRoot !== 'undefined';

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
    /** Component Unique Identifier (TODO: this should be removed - Issue #951) */
    uid: number;
    /** Component Creation Index */
    idx: number;
    /** Component state, analogous to Element.isConnected */
    state: VMState;
    data: VNodeData;
    children: VNodes;
    velements: VCustomElement[];
    cmpTemplate?: Template;
    cmpProps: any;
    cmpSlots: SlotSet;
    cmpTrack: any;
    cmpRoot: ShadowRoot;
    component?: ComponentInterface;
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
    fallback: boolean;
    mode: string;
    deps: VM[][];
    toString(): string;
}

export interface VM extends UninitializedVM {
    cmpTemplate: Template;
    component: ComponentInterface;
}

let idx: number = 0;
let uid: number = 0;

function callHook(
    cmp: ComponentInterface | undefined,
    fn: (...args: any[]) => any,
    args: any[] = []
): any {
    return fn.apply(cmp, args);
}

function setHook(cmp: ComponentInterface, prop: PropertyKey, newValue: any) {
    cmp[prop] = newValue;
}

function getHook(cmp: ComponentInterface, prop: PropertyKey): any {
    return cmp[prop];
}

// DO NOT CHANGE this:
// these two values are used by the synthetic-shadow implementation to traverse the DOM
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export function rerenderVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    rehydrate(vm);
}

export function appendRootVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    runConnectedCallback(vm);
    rehydrate(vm);
}

export function appendVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
    }
    runConnectedCallback(vm);
    rehydrate(vm);
}

// just in case the component comes back, with this we guarantee re-rendering it
// while preventing any attempt to rehydration until after reinsertion.
function resetComponentStateWhenRemoved(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    runDisconnectedCallback(vm);
    runChildrenDisconnectedCallback(vm);
}

// this method is triggered by the diffing algo only when a vnode from the
// old vnode.children is removed from the DOM.
export function removeVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(vm.state === VMState.connected, `${vm} must be inserted.`);
    }
    resetComponentStateWhenRemoved(vm);
}

// this method is triggered by the removal of a root element from the DOM.
export function removeRootVM(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    resetComponentStateWhenRemoved(vm);
}

export interface CreateVMInit {
    mode: 'open' | 'closed';
    // custom settings for now
    fallback: boolean;
    isRoot?: boolean;
    owner: VM | null;
}

export function createVM(elm: HTMLElement, Ctor: ComponentConstructor, options: CreateVMInit) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            elm instanceof HTMLElement,
            `VM creation requires a DOM element instead of ${elm}.`
        );
    }
    const def = getComponentDef(Ctor);
    const { isRoot, mode, fallback, owner } = options;
    const shadowRootOptions: ShadowRootInit = {
        mode,
        delegatesFocus: !!Ctor.delegatesFocus,
    };
    uid += 1;
    idx += 1;
    const uninitializedVm: UninitializedVM = {
        uid,
        // component creation index is defined once, and never reset, it can
        // be preserved from one insertion to another without any issue
        idx,
        state: VMState.created,
        isScheduled: false,
        isDirty: true,
        isRoot: isTrue(isRoot),
        fallback,
        mode,
        def,
        owner,
        elm,
        data: EmptyObject,
        context: create(null),
        cmpTemplate: undefined,
        cmpProps: create(null),
        cmpTrack: create(null),
        cmpSlots: fallback ? create(null) : undefined,
        cmpRoot: elm.attachShadow(shadowRootOptions),
        callHook,
        setHook,
        getHook,
        component: undefined,
        children: EmptyArray,
        velements: EmptyArray,
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
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
    linkComponent(initializedVm);
}

function rehydrate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    const { rendered } = Services;
    if (rendered) {
        invokeServiceHook(vm, rendered);
    }
    const { renderedCallback } = vm.def;
    if (!isUndefined(renderedCallback)) {
        if (process.env.NODE_ENV !== 'production') {
            startMeasure('renderedCallback', vm);
        }

        invokeComponentCallback(vm, renderedCallback);

        if (process.env.NODE_ENV !== 'production') {
            endMeasure('renderedCallback', vm);
        }
    }
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    const { state } = vm;
    if (state === VMState.disconnected) {
        return; // nothing to do since it was already disconnected
    }
    if (isFalse(vm.isDirty)) {
        // this guarantees that if the component is reused/reinserted,
        // it will be re-rendered because we are disconnecting the reactivity
        // linking, so mutations are not automatically reflected on the state
        // of disconnected components.
        markComponentAsDirty(vm);
    }
    clearReactiveListeners(vm);
    vm.state = VMState.disconnected;
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

function runChildrenDisconnectedCallback(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    const { velements: vCustomElementCollection } = vm;
    // reporting disconnection for every child
    for (let i = 0, len = vCustomElementCollection.length; i < len; i += 1) {
        const elm = vCustomElementCollection[i].elm;
        // There are two cases where the element could be undefined:
        // * when there is an error during the construction phase, and an
        //   error boundary picks it, there is a possibility that the VCustomElement
        //   is not properly initialized, and therefore is should be ignored.
        // * when slotted custom element is not used by the element where it is slotted
        //   into it, as a result, the custom element was never initialized.
        if (!isUndefined(elm)) {
            const childVM = getCustomElementVM(elm as HTMLElement);
            runDisconnectedCallback(childVM);
            runChildrenDisconnectedCallback(childVM);
        }
    }
}

// This is a super optimized mechanism to remove the content of the shadowRoot
// without having to go into snabbdom. Especially useful when the reset is a consequence
// of an error, in which case the children VNodes might not be representing the current
// state of the DOM
export function resetShadowRoot(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    const { fallback } = vm;
    vm.children = EmptyArray;
    if (isTrue(fallback)) {
        // synthetic-shadow does not have a real cmpRoot instance, instead
        // we need to remove the content of the host entirely
        innerHTMLSetter.call(vm.elm, '');
    } else {
        ShadowRootInnerHTMLSetter.call(vm.cmpRoot, '');
    }
    // disconnecting any known custom element inside the shadow of the this vm
    runChildrenDisconnectedCallback(vm);
}

export function scheduleRehydration(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}

function getErrorBoundaryVMFromOwnElement(vm: VM): VM | undefined {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
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
            ArrayPush.call(
                wcStack,
                `<${StringToLowerCase.call(tagName)}${is ? ' is="${is}' : ''}>`
            );
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
    return isNull(parentElement) && isNativeShadowRootAvailable
        ? getHostElement(elm)
        : parentElement;
}

/**
 * Finds the host element, if it exists.
 */
function getHostElement(elm: Element): Element | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isNativeShadowRootAvailable,
            'getHostElement should only be called if native shadow root is available'
        );
        assert.isTrue(
            isNull(parentElementGetter.call(elm)),
            `getHostElement should only be called if the parent element of ${elm} is null`
        );
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

export function getCustomElementVM(elm: HTMLElement): VM {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(elm, ViewModelReflection);
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    return getInternalField(elm, ViewModelReflection) as VM;
}

export function getComponentVM(component: ComponentInterface): VM {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getHiddenField(component, ViewModelReflection);
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    return getHiddenField(component, ViewModelReflection) as VM;
}

export function getShadowRootVM(root: ShadowRoot): VM {
    // TODO: this eventually should not rely on the symbol, and should use a Weak Ref
    if (process.env.NODE_ENV !== 'production') {
        const vm = getInternalField(root, ViewModelReflection);
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    return getInternalField(root, ViewModelReflection) as VM;
}

// slow path routine
// NOTE: we should probably more this routine to the synthetic shadow folder
// and get the allocation to be cached by in the elm instead of in the VM
export function allocateInSlot(vm: VM, children: VNodes) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    let error;
    pre();
    try {
        job();
    } catch (e) {
        error = Object(e);
    } finally {
        post();
        if (!isUndefined(error)) {
            error.wcStack = error.wcStack || getErrorComponentStack(vm.elm);
            const errorBoundaryVm = isNull(owner)
                ? undefined
                : getErrorBoundaryVMFromOwnElement(owner);
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
