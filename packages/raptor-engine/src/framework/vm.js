import assert from "./assert.js";
import { getComponentDef } from "./def.js";
import { createComponent } from "./component.js";
import { patch } from "./patch.js";
import { assign, create, isArray, toString, ArrayPush } from "./language.js";
import { addCallbackToNextTick } from "./utils.js";

let uid: number = 0;
const globalMap: HashTable<VM> = create(null);

export function lockUID(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.uid === 0, `${vm} is already locked to a previous generated uid.`);
    vm.uid = ++uid;
    globalMap[uid] = vm;
}

export function unlockUID(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.uid > 0, `${vm} is not locked to a previous generated uid.`);
    globalMap[vm.uid] = undefined;
    vm.uid = 0;
}

export function createVM(vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.invariant(vnode.elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    const { Ctor } = vnode;
    const def = getComponentDef(Ctor);
    console.log(`[object:vm ${def.name}] is being initialized.`);
    if (!def.isStateful) {
        // TODO: update when functionals are supported
        throw new TypeError(`${def.name} is not an Element. At the moment, only components extending Element from "engine" are supported. Functional components will eventually be supported.`);
    }
    const vm: VM = {
        uid: 0,
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        cmpProps: {},
        cmpState: undefined,
        cmpSlots: undefined,
        cmpEvents: undefined,
        cmpClasses: undefined,
        cmpTemplate: undefined,
        classListObj: undefined,
        component: undefined,
        // used to store the latest result of the render method
        fragment: [],
        // used to track down all object-key pairs that makes this vm reactive
        deps: [],
    };
    assert.block(function devModeCheck() {
        vm.toString = (): string => {
            return `[object:vm ${def.name} (${vm.uid ? vm.uid : 'standalone'})]`;
        };
    });
    vnode.vm = vm;
    const vnodeBeingConstructedInception = vnodeBeingConstructed;
    vnodeBeingConstructed = vnode;
    createComponent(vm, Ctor);
    vnodeBeingConstructed = vnodeBeingConstructedInception;
    // note to self: invocations during construction to get the vnode associated
    // to the component works fine as well because we can use `vmBeingCreated`
    // in getLinkedVNode() as a fallback patch for resolution.
    setLinkedVNode(vm.component, vnode);
}

const ComponentToVNodeMap: Map<Component, VNode> = new WeakMap();

let vnodeBeingConstructed: ComponentVNode | null = null;

export function setLinkedVNode(component: Component, vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, `Only DOM elements can be linked to their corresponding component.`);
    ComponentToVNodeMap.set(component, vnode);
}

export function getLinkedVNode(component: Component): ComponentVNode {
    assert.isTrue(component, `invalid component`);
    // note to self: we fallback to `vmBeingCreated` in case users
    // invoke something during the constructor execution, in which
    // case this mapping hasn't been stable yet, but we know that's
    // the only case.
    const vnode = ComponentToVNodeMap.get(component) || vnodeBeingConstructed;
    assert.vnode(vnode);
    return vnode;
}

export function rehydrate(vm: VM) {
    assert.vm(vm);
    if (vm.uid && vm.isDirty) {
        const vnode = getLinkedVNode(vm.component);
        assert.isTrue(vnode.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
        assert.invariant(isArray(vnode.children), `Rendered ${vm}.children should always have an array of vnodes instead of ${toString(vnode.children)}`);
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode (oldVnode) with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders, but we do so by keeping the vnode originally used by parent
        // as the source of true, in case the parent tries to rehydrate against that one.
        const oldVnode = assign({}, vnode);
        const { data } = vnode;
        vm.isDirty = true;
        vnode.data = assign({}, data);
        vnode.children = [];
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

let rehydrateQueue: Array<VM> = [];

function flushRehydrationQueue() {
    assert.invariant(rehydrateQueue.length, `If rehydrateQueue was scheduled, it is because there must be at least one VM on this pending queue instead of ${rehydrateQueue}.`);
    const vms: Array<VM> = rehydrateQueue.sort((a: VM, b: VM): boolean => a.uid > b.uid);
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
