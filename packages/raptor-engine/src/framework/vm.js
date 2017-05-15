import assert from "./assert.js";
import { getComponentDef } from "./def.js";
import { createComponent } from "./component.js";
import { patch } from "./patch.js";
import { assign, isArray, toString, ArrayPush } from "./language.js";
import { addCallbackToNextTick } from "./utils.js";

let idx: number = 0;

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
    assert.invariant(vnode.elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    const { Ctor } = vnode;
    const def = getComponentDef(Ctor);
    console.log(`[object:vm ${def.name}] is being initialized.`);
    const vm: VM = {
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
    createComponent(vm, Ctor);
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
