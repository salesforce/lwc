// @flow

///<reference path="types.d.ts"/>

import {
    createComponent,
    spinComponent,
    patchComponent,
    destroyComponent,
} from "./vm.js";

import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";

import assert from "./assert.js";

export function init(vm: VM) {
    assert.vm(vm);
    if (!vm.flags) {
        createComponent(vm);
    }
    if (!vm.flags.isReady) {
        spinComponent(vm);
    }
}

export function prepatch(oldvm: VM, vm: VM) {
    assert.vm(vm);
    console.log(`<${vm.Ctor.name}> is being patched.`);
    if (oldvm !== vm) {
        const { Ctor: oldCtor } = oldvm;
        const { Ctor } = vm;
        if (!oldCtor || oldCtor !== Ctor) {
            createComponent(vm);
            spinComponent(vm);
        } else {
            assert.vm(oldvm);
            patchComponent(vm, oldvm);
        }
    }
}

export function insert(vm: VM) {
    assert.vm(vm);
    console.log(`${vm} is being inserted.`);
    const { vnode } = vm;
    assert.vnode(vnode, `The insert hook in a Component cannot be called if there is not a child vnode.`);
    vnode.elm = vm.elm;
    const { data: { hook: subHook } } = vnode;
    if (subHook && subHook.insert === insert) {
        insert(vnode);
    }
    invokeComponentConnectedCallback(vm);
}

export function destroy(vm: VM) {
    assert.vm(vm);
    console.log(`${vm} is being destroyed.`);
    const { vnode } = vm;
    assert.vnode(vnode, `The destroy hook in a Component cannot be called if there is not a child vnode.`);
    const { data: { hook: subHook } } = vnode;
    if (subHook && subHook.destroy === destroy) {
        destroy(vnode);
    }
    invokeComponentDisconnectedCallback(vm);
    destroyComponent(vm);
}
