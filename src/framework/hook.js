import {
    createComponent,
    updateComponent,
    destroyComponent,
    initFromAnotherVM,
} from "./vm.js";
import {
    batchUpdateComponentProps,
} from "./props.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";

import assert from "./assert.js";

export function init(vm: VM) {
    assert.vm(vm);
    console.log(`<${vm.Ctor.name}> is being initialized.`);
    createComponent(vm);
}

export function prepatch(oldvm: VM, vm: VM) {
    assert.vm(vm);
    console.log(`<${vm.Ctor.name}> is being patched.`);
    if (oldvm !== vm) {
        const { Ctor: oldCtor } = oldvm;
        const { Ctor } = vm;
        if (oldCtor === Ctor) {
            assert.vm(oldvm);
            console.log(`${oldvm} is being rehydrated.`);
            initFromAnotherVM(vm, oldvm);
        }
        const { state, body, flags } = vm;
        batchUpdateComponentProps(vm, state, body);
        // there is an edge case here that maybe isDirty is not really
        // a consequence of calling `batchUpdateComponentProps()`, but something
        // that is pending to be done in the next tick. as a result, the update
        // will be carry on during the same tick, which is not a problem at all.
        if (flags.isDirty) {
            updateComponent(vm);
        }
    }
}

export function insert(vm: VM) {
    assert.vm(vm);
    console.log(`${vm} is being inserted.`);
    if (vm.flags.hasElement && vm.component.connectedCallback) {
        invokeComponentConnectedCallback(vm);
    }
}

export function destroy(vm: VM) {
    assert.vm(vm);
    console.log(`${vm} is being destroyed.`);
    if (vm.flags.hasElement && vm.component.disconnectedCallback) {
        invokeComponentDisconnectedCallback(vm);
    }
    if (vm.listeners.size > 0) {
        destroyComponent(vm);
    }
}
