// @flow

///<reference path="types.d.ts"/>

import assert from "./assert.js";
import { init } from "snabbdom";
import props from "snabbdom/modules/props";
import attrs from "snabbdom/modules/attributes";
import on from "snabbdom/modules/eventlisteners";
import { updateComponent } from "./vm.js";

export const patch = init([
    props,
    attrs,
    on,
]);

function rehydrate(vm: VM) {
    assert.vm(vm);
    const { flags } = vm;
    if (flags.isDirty) {
        updateComponent(vm);
    }
    flags.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    const { flags } = vm;
    if (!flags.isScheduled && flags.isReady) {
        flags.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail('Error attempting to rehydrate component <${vm}>: ' + error.message);
        });
    }
}
