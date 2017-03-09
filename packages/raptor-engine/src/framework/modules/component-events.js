import assert from "../assert.js";
import {
    removeComponentEventListener,
    addComponentEventListener,
} from "../component.js";

function syncEvents(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }

    let { data: { _on: oldOn } } = oldVnode;
    let { data: { _on: newOn } } = vnode;
    let key: string, cur: any, old: any;

        // infuse key-value pairs from _on into the component
    if (oldOn !== newOn && (oldOn || newOn)) {
        oldOn = oldOn || {};
        newOn = newOn || {};
        // removed event listeners should be reset in component's events
        for (key in oldOn) {
            if (!(key in newOn)) {
                removeComponentEventListener(vm, key, oldOn[key]);
            }
        }

        // new or different event listeners should be set in component's events
        for (key in newOn) {
            cur = newOn[key];
            old = oldOn[key];
            if (key in oldOn && old != cur) {
                removeComponentEventListener(vm, key, oldOn[key]);
            }
            if (oldOn[key] != cur) {
                addComponentEventListener(vm, key, cur);
            }
        }
    }

    // reflection of component event listeners into data.on for the regular diffing algo
    let { data: { on } } = vnode;
    assert.invariant(Object.getOwnPropertyNames(on).length === 0, 'vnode.data.on should be an empty object.');
    Object.assign(on, vm.cmpEvents);
}

export default {
    create: syncEvents,
    update: syncEvents,
};
