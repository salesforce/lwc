import assert from "./assert";
import { getComponentDef } from "./def";
import { createComponent, linkComponent, renderComponent } from "./component";
import { patch } from "./patch";
import { ArrayPush, isUndefined, keys, defineProperties } from "./language";
import { addCallbackToNextTick, noop, EmptyObject } from "./utils";
import { ViewModelReflection } from "./def";
import { invokeServiceHook, Services } from "./services";
import { invokeComponentMethod } from "./invoker";

let idx: number = 0;
let uid: number = 0;

export const OwnerKey = Symbol('key');

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
    const { component: { connectedCallback } } = vm;
    if (connectedCallback && connectedCallback !== noop) {
        invokeComponentMethod(vm, 'connectedCallback');
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
    const { component: { disconnectedCallback } } = vm;
    if (disconnectedCallback && disconnectedCallback !== noop) {
        invokeComponentMethod(vm, 'disconnectedCallback');
    }
}

export function createVM(vnode: ComponentVNode) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vnode(vnode);
        assert.invariant(vnode.elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    }
    const { elm, Ctor } = vnode;
    const def = getComponentDef(Ctor);

    uid += 1;
    const vm: VM = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        cmpProps: {},
        cmpTrack: {},
        cmpState: undefined,
        cmpSlots: undefined,
        cmpEvents: undefined,
        cmpListener: undefined,
        cmpClasses: undefined,
        cmpTemplate: undefined,
        cmpRoot: undefined,
        classListObj: undefined,
        component: undefined,
        vnode,
        shadowVNode: createShadowRootVNode(elm, []),
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };

    if (process.env.NODE_ENV !== 'production') {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    }
    vnode.vm = vm;
    // linking elm with VM before creating the instance
    elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    createComponent(vm, Ctor);
    linkComponent(vm);

    if (process.env.NODE_ENV !== 'production') {
        const { component: { attributeChangedCallback }, def: { observedAttrs } } = vm;
        if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
            console.warn(`${vm} has static observedAttributes set to ["${keys(observedAttrs).join('", "')}"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.`);
        }
    }
    return vm;
}

export function relinkVM(vm: VM, vnode: ComponentVNode) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.vnode(vnode);
        assert.isTrue(vnode.elm instanceof HTMLElement, `Only DOM elements can be linked to their corresponding component.`);
        assert.invariant(vm.component, `vm.component is required to be defined before ${vm} gets linked to ${vnode}.`);
    }
    vnode.vm = vm;
    vm.vnode = vnode;
}
export function rehydrate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (vm.idx && vm.isDirty) {
        const { vnode } = vm;
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vnode.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
        }
        const children = renderComponent(vm);
        vm.isScheduled = false;
        patchShadowRoot(vm, children);
        const { rendered } = Services;
        if (rendered) {
            invokeServiceHook(vm, rendered);
        }
        const { component: { renderedCallback } } = vm;
        if (renderedCallback && renderedCallback !== noop) {
            invokeComponentMethod(vm, 'renderedCallback');
        }
    }
}

let rehydrateQueue: Array<VM> = [];

function flushRehydrationQueue() {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    }
    const vms: Array<VM> = rehydrateQueue.sort((a: VM, b: VM): boolean => a.idx > b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        rehydrate(vms[i]);
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
        assert.childNode(vm.vnode.elm, node, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${vm}`);
    }
    // @ts-ignore
    return node[OwnerKey] === vm.uid;
}

export function wasNodePassedIntoVM(vm: VM, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(node instanceof Node, `isNodePassedToVM() should be called with a node as the second argument instead of ${node}`);
        assert.childNode(vm.vnode.elm, node, `isNodePassedToVM() should never be called with a node that is not a child node of ${vm}`);
    }
    const { vnode: { uid: ownerUid } } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    // @ts-ignore
    return node[OwnerKey] === ownerUid;
}

function createShadowRootVNode(elm: Element, children: VNode[]): VNode {
    const sel = elm.tagName.toLocaleLowerCase();
    const vnode: VNode = {
        sel,
        data: EmptyObject,
        children,
        elm,
        key: undefined,
        text: undefined,
    };
    return vnode;
}

export function patchShadowRoot(vm: VM, children: VNode[]) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { shadowVNode: oldShadowVNode } = vm;
    const shadowVNode = createShadowRootVNode(vm.vnode.elm, children);
    vm.shadowVNode = patch(oldShadowVNode, shadowVNode);
}
