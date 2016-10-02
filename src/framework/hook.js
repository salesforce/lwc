// @flow

import {
    createComponent,
    updateComponent,
    initFromScratch,
    initFromAnotherVM,
} from "./vm.js";

import {
    invokeComponentAttachMethod,
    invokeComponentDetachMethod,
} from "./invoker.js";

import assert from "./assert.js";

import { updateComponentAttributes } from "./attribute.js";

export function init(vm: Object) {
    assert.vm(vm);
    initFromScratch(vm);
    createComponent(vm);
}

export function prepatch(oldvm: Object, vm: Object) {
    assert.vm(oldvm);
    assert.vm(vm);
    const { Ctor: oldCtor } = oldvm;
    const { Ctor, api, data: { props: state }, children: body } = vm;
    if (oldvm !== vm) {
        if (oldCtor !== Ctor) {
            createComponent(vm);
        } else {
            if (api === undefined) {
                initFromAnotherVM(vm, oldvm);
            }
            updateComponentAttributes(vm, state, body);
            if (vm.isDirty) {
                updateComponent(vm);
            }
        }
    }
}

export function insert(vm: Object) {
    assert.vm(vm);
    const { vnode } = vm;
    assert.vnode(vnode, 'The insert hook in a Component cannot be called if there is not a child vnode.');
    vnode.elm = vm.elm;
    const { data: { hook: subHook } } = vnode;
    if (subHook && subHook.insert === insert) {
        insert(vnode);
    }
    invokeComponentAttachMethod(vm);
}

export function destroy(vm: Object) {
    assert.vm(vm);
    const { vnode } = vm;
    assert.vnode(vnode, 'The destroy hook in a Component cannot be called if there is not a child vnode.');
    const { data: { hook: subHook } } = vnode;
    if (subHook && subHook.destroy === destroy) {
        destroy(vnode);
    }
    invokeComponentDetachMethod(vm);
    vm.vnode = null;
}
