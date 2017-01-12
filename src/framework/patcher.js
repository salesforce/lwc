import assert from "./assert.js";
import { init } from "snabbdom";
import props from "snabbdom/modules/props";
import attrs from "snabbdom/modules/attributes";
import style from "snabbdom/modules/style";
import dataset from "snabbdom/modules/dataset";
import on from "snabbdom/modules/eventlisteners";
import className from "./className";

export const patch = init([
    props,
    attrs,
    style,
    dataset,
    className,
    on,
]);

function rehydrate(vm: VM) {
    assert.vm(vm);
    const { flags, elm } = vm;
    assert.isTrue(elm instanceof HTMLElement, `rehydration can only happen after the element is created instead of ${elm}.`);
    if (flags.isDirty) {
        patch(elm, vm);
    }
    flags.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    const { flags } = vm;
    if (!flags.isScheduled) {
        flags.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail(`Error attempting to rehydrate component <${vm}>: ${error.message}`);
        });
    }
}
