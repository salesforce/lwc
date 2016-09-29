// @flow

import { init } from "snabbdom";
import props from "snabbdom/modules/props";
import attributes from "snabbdom/modules/attributes";
import eventlisteners from "snabbdom/modules/eventlisteners";
import { updateComponent } from "./component.js";

export const patch = init([
    props,
    attributes,
    eventlisteners,
]);

export function scheduleRehydration(vnode: Object) {
    const { data: { state } } = vnode;
    if (!state.isScheduled && state.isReady) {
        state.isScheduled = true;
        Promise.resolve().then((): any => {
            if (state.isDirty) {
                updateComponent(vnode);
            }
        });
    }
}
