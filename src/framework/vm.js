import assert from "./assert.js";
import {
    initComponentProps,
} from "./props.js";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
} from "./invoker.js";
import { watchProperty } from "./watcher.js";
import { getComponentDef } from "./def.js";
import { HTMLElement } from "./html-element.js";

// at this point, the child vnode is ready, and all possible bits that are
// needed by the engine to render the element, should be propagated from
// the vnode to the parent vm, we call this the folding process.
function foldVnode(vm: VM, vnode: VNode) {
    const { sel, children, text, data: { attrs, props, on, class: klass, dataset, style } } = vnode;
    const { Ctor, data: { hook } } = vm;
    if (!Ctor.sel) {
        Ctor.sel = sel;
    } else {
        assert.isTrue(Ctor.sel === sel, `The selector of the child vnode ${vnode} must always match ${sel}`);
    }
    vm.sel = sel;
    vm.children = children;
    vm.text = text;
    // the list of data members must be fixed, and hook should always be preserved
    // TODO: there must be some other hack that we can do to use a different set
    // of hooks for folding components vs custom components
    vm.data = { hook, props, attrs, on, class: klass, dataset, style };
}

export function initFromAnotherVM(vm: VM, oldvm: VM) {
    const { component, vnode, toString, body, state, children, data, flags, listeners, def, context } = oldvm;
    vm.data = data;
    vm.state = state;
    vm.body = body;
    vm.flags = flags;
    vm.def = def;
    vm.context = context;
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
    const { Ctor, data, state, body } = vm;
    console.log(`<${Ctor.name}> is being initialized.`);
    const flags = {
        hasBodyAttribute: false,
        isScheduled: false,
        isDirty: false,
        hasElement: false,
    };
    const def = getComponentDef(Ctor);
    const emptyvm = {
        state,
        body,
        data,
        flags,
        def,
        context: {},
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
    const component = invokeComponentConstructor(vm);
    vm.component = component;
    const hasElement = component instanceof HTMLElement;
    flags.hasElement = hasElement;
    watchComponentProperties(vm);
    initComponentProps(vm, state, body);
    let vnode = invokeComponentRenderMethod(vm);
    if (hasElement) {
        data.attrs = data.attrs || {};
        vm.vnode = vnode;
        vm.children = [vnode];
    } else {
        foldVnode(vm, vnode);
    }
    flags.isDirty = false;
}

export function updateComponent(vm: VM) {
    const { flags } = vm;
    const { isDirty, hasElement } = flags;
    assert.invariant(isDirty, `Component ${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    let vnode = invokeComponentRenderMethod(vm);
    if (hasElement) {
        vm.vnode = vnode;
        vm.children = [vnode];
    } else {
        foldVnode(vm, vnode);
    }
    flags.isDirty = false;
}

export function destroyComponent(vm: VM) {
    assert.vm(vm);
    clearListeners(vm);
}
