import { patch } from "./patcher.js";
import assert from "./assert.js";
import {
    batchUpdateComponentProps,
    initComponentProps,
} from "./props.js";
import {
    invokeComponentRenderMethod,
} from "./invoker.js";
import { watchProperty } from "./watcher.js";
import { getComponentDef } from "./def.js";

// at this point, the child vnode is ready, and all possible bits that are
// needed by the engine to render the element, should be propagated from
// the vnode to the parent vm, we call this the folding process.
function foldVnode(vm: VM, vnode: VNode) {
    const { sel, children, text, data } = vnode;
    vm.sel = sel;
    vm.children = children;
    vm.text = text;
    Object.assign(vm.data, data);
}

function initFromAnotherVM(vm: VM, oldvm: VM) {
    const { component, vnode, toString, body, state, children, data, flags, listeners, def } = oldvm;
    vm.data = data;
    vm.state = state;
    vm.body = body;
    vm.flags = flags;
    vm.def = def;
    vm.component = component;
    vm.vnode = vnode;
    vm.listeners = listeners;
    vm.toString = toString;
    vm.children = children;
}

function watchComponentProperties(vm: VM) {
    assert.vm(vm);
    const { component } = vm;
    Object.getOwnPropertyNames(component).forEach((propName: string) => {
        watchProperty(component, propName);
    });
}

function clearListeners(vm: VM) {
    assert.vm(vm);
    const { listeners } = vm;
    listeners.forEach((propSet: Set<VM>): boolean => propSet.delete(vm));
    listeners.clear();
}

export function createComponent(vm: VM) {
    const { Ctor, data, children: body } = vm;
    console.log(`<${Ctor.name}> is being initialized.`);
    const { props: state = {} } = data;
    const flags = {
        hasBodyAttribute: false,
        isReady: false,
        isScheduled: false,
        isDirty: false,
    };
    const def = getComponentDef(Ctor);
    const emptyvm = {
        state,
        body,
        data,
        flags,
        def,
        component: null,
        vnode: null,
        listeners: new Set(),
        // TODO: maybe don't belong here...
        toString: (): string => {
            const type = Ctor.name;
            return `<${type}>`;
        },
    };
    initFromAnotherVM(vm, emptyvm);
    vm.data.props = undefined;
    vm.component = new Ctor();
    initComponentProps(vm, state, body);
}

export function spinComponent(vm: VM) {
    const { flags } = vm;
    assert.isFalse(flags.isReady, 'spinComponent() should be invoked once.');
    watchComponentProperties(vm);
    flags.isReady = true;
    let vnode = invokeComponentRenderMethod(vm);
    vm.vnode = vnode;
    flags.isDirty = false;
    foldVnode(vm, vnode);
}

export function updateComponent(vm: VM) {
    const { flags, vnode } = vm;
    const { isDirty, isReady } = flags;
    assert.invariant(vnode, `Component ${vm} does not have a child vnode yet.`);
    assert.invariant(isReady, `Component ${vm} is not ready to be updated.`);
    assert.invariant(isDirty, `Component ${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    // TODO: what about null results from render?
    let newVnode = invokeComponentRenderMethod(vm);
    newVnode = patch(vnode, newVnode);
    vm.vnode = newVnode;
    flags.isDirty = false;
    foldVnode(vm, newVnode);
}

export function patchComponent(vm: VM, oldvm: VM) {
    assert.vm(vm);
    assert.vm(oldvm);
    assert.isTrue(vm.Ctor === oldvm.Ctor, `patchComponent() can only be used with two equivalent vm objects.`);
    console.log(`${oldvm} is being rehydrated.`);
    const { data: { props: state }, children: body } = vm;
    initFromAnotherVM(vm, oldvm);
    batchUpdateComponentProps(vm, state, body);
    // TODO: there is an edge case here that maybe isDirty is not really
    // a consequence of calling `batchUpdateComponentProps()`, but something
    // that is pending to be done in the next tick
    if (vm.flags.isDirty) {
        updateComponent(vm);
    }
}

export function destroyComponent(vm: VM) {
    assert.vm(vm);
    clearListeners(vm);
}
