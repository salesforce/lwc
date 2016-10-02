// @flow

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

export function scheduleRehydration(vm: Object) {
    const { isScheduled, isReady, isDirty } = vm;
    if (!isScheduled && isReady) {
        vm.isScheduled = true;
        Promise.resolve().then((): any => {
            if (isDirty) {
                updateComponent(vm);
            }
        });
    }
}
