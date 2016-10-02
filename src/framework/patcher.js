// @flow

import { init } from "snabbdom";
import props from "snabbdom/modules/props";
import attrs from "snabbdom/modules/attributes";
import on from "snabbdom/modules/eventlisteners";
import { updateComponent } from "./component.js";

export const patch = init([
    props,
    attrs,
    on,
]);

export function scheduleRehydration(vnode: Object) {
    const { isScheduled, isReady, isDirty } = vnode;
    if (!isScheduled && isReady) {
        vnode.isScheduled = true;
        Promise.resolve().then((): any => {
            if (isDirty) {
                updateComponent(vnode);
            }
        });
    }
}
