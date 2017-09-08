import assert from "./assert";
import { getComponentDef } from "./def";
import { createComponent, linkComponent } from "./component";
import { patch } from "./patch";
import { assign, isArray, toString, ArrayPush, isUndefined, keys, defineProperties } from "./language";
import { addCallbackToNextTick } from "./utils";
import { ViewModelReflection } from "./def";

let idx: number = 0;
let uid: number = 0;

export const OwnerKey = Symbol('key');

export function addInsertionIndex(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.idx === 0, `${vm} is already locked to a previously generated idx.`);
    vm.idx = ++idx;
}

export function removeInsertionIndex(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.idx > 0, `${vm} is not locked to a previously generated idx.`);
    vm.idx = 0;
}

export function createVM(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { elm, Ctor } = vnode;
    assert.invariant(elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    const def = getComponentDef(Ctor);
    console.log(`[object:vm ${def.name}] is being initialized.`);
    uid += 1;
    const vm: VM = {
        uid,
        idx: 0,
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        cmpProps: {},
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
        // used to store the latest result of the render method
        fragment: [],
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    assert.block(function devModeCheck() {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.idx})]`;
        };
    });
    vnode.vm = vm;
    // linking elm with VM before creating the instance
    elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    createComponent(vm, Ctor);
    linkComponent(vm);
    assert.block(function devModeCheck() {
        const { component: { attributeChangedCallback }, def: { observedAttrs } } = vm;
        if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
            console.warn(`${vm} has static observedAttributes set to ["${keys(observedAttrs).join('", "')}"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.`);
        }
    });
    return vm;
}

export function relinkVM(vm: VM, vnode: ComponentVNode) {
    assert.vm(vm);
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, `Only DOM elements can be linked to their corresponding component.`);
    assert.invariant(vm.component, `vm.component is required to be defined before ${vm} gets linked to ${vnode}.`);
    vnode.vm = vm;
    vm.vnode = vnode;
}
export function rehydrate(vm: VM) {
    assert.vm(vm);
    if (vm.idx && vm.isDirty) {
        const { vnode } = vm;
        assert.isTrue(vnode.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
        assert.invariant(isArray(vnode.children), `Rendered ${vm}.children should always have an array of vnodes instead of ${toString(vnode.children)}`);
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode (oldVnode) with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders, but we do so by keeping the vnode originally used by parent
        // as the source of true, in case the parent tries to rehydrate against that one.
        const oldVnode = assign({}, vnode);
        vnode.children = [];
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

let rehydrateQueue: Array<VM> = [];

function flushRehydrationQueue() {
    assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    const vms: Array<VM> = rehydrateQueue.sort((a: VM, b: VM): boolean => a.idx > b.idx);
    rehydrateQueue = []; // reset to a new queue
    for (let i = 0, len = vms.length; i < len; i += 1) {
        rehydrate(vms[i]);
    }
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        if (rehydrateQueue.length === 0) {
            addCallbackToNextTick(flushRehydrationQueue);
        }
        ArrayPush.call(rehydrateQueue, vm);
    }
}

export function isNodeOwnedByVM(vm: VM, node: Node): boolean {
    assert.vm(vm);
    assert.invariant(node instanceof Node, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
    assert.childNode(vm.vnode.elm, node, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${vm}`);
    // @ts-ignore
    return node[OwnerKey] === vm.uid;
}

export function wasNodePassedIntoVM(vm: VM, node: Node): boolean {
    assert.vm(vm);
    assert.invariant(node instanceof Node, `isNodePassedToVM() should be called with a node as the second argument instead of ${node}`);
    assert.childNode(vm.vnode.elm, node, `isNodePassedToVM() should never be called with a node that is not a child node of ${vm}`);
    const { vnode: { uid: ownerUid } } = vm;
    // TODO: we need to walk the parent path here as well, in case they passed it via slots multiple times
    // @ts-ignore
    return node[OwnerKey] === ownerUid;
}
