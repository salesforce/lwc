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
    console.log(`<${vm.Ctor.name}> is being prepatched.`);
    if (oldvm !== vm) {
        const { Ctor: oldCtor } = oldvm;
        const { Ctor, state, body } = vm;
        if (oldCtor === Ctor) {
            assert.vm(oldvm);
            initFromAnotherVM(vm, oldvm);
        } else if (vm.elm && !oldvm.data.hook) {
            // there is an edge case where we are attempting to patch an existing rendered vm
            // against its previous Dom structure, in which case the oldvm will be synthetic
            // created by the engine without the children collection, if that's the case, we
            // should make sure that we are diffing against a fully loaded oldvm.
            oldvm.children = vm.children;
            oldvm.text = vm.text;
        }
        batchUpdateComponentProps(vm, state, body);
        // there is an edge case here that maybe isDirty is not really
        // a consequence of calling `batchUpdateComponentProps()`, but something
        // that is pending to be done in the next tick. as a result, the update
        // will be carry on during the same tick, which is not a problem at all.
        if (vm.flags.isDirty) {
            console.log(`${oldvm} is being rehydrated.`);
            updateComponent(vm);
        } else if (oldCtor === Ctor) {
            console.log(`${oldvm} is being skipped.`);
            // hard-wire to prevent engine diffing down the rabbit hole when
            // the state is the exact same as before.
            oldvm.children = vm.children;
            oldvm.data = vm.data;
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
