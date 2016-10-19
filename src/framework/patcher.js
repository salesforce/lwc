// @flow

///<reference path="types.d.ts"/>

import assert from "./assert.js";
import { init } from "snabbdom";
import props from "snabbdom/modules/props";
import attrs from "snabbdom/modules/attributes";
import on from "./listener.js";
import { updateComponent } from "./vm.js";

export const patch = init([
    props,
    attrs,
    on,
]);

function rehydrate(vm: VM) {
    assert.vm(vm);
    const { isDirty } = vm;
    if (isDirty) {
        updateComponent(vm);
    }
    vm.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    const { isScheduled, isReady } = vm;
    if (!isScheduled && isReady) {
        vm.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail('Error attempting to rehydrate component <${vm}>: ' + error.message);
        });
    }
}
