import { isUndefined } from "../language.js";
import { EmptyObject } from "../utils.js";

function handleEvent(event: Event, vnode: VNode) {
    const { type } = event;
    const { data: { on } } = vnode;
    let handler = on && on[type];
    // call event handler if exists
    if (handler) {
        handler.call(undefined, event);
    }
}

function createListener(): EventListener {
    return function handler(event: Event) {
        handleEvent(event, handler.vnode);
    }
}

function removeAllEventListeners(vnode: VNode) {
    const { data: { on }, listener } = vnode;
    if (on && listener) {
        const { elm } = vnode;
        let name;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vnode.listener = undefined;
    }
}

function updateEventListeners(oldVnode: VNode, vnode: VNode) {
    const { data: { on: oldOn = EmptyObject } } = oldVnode;
    const { data: { on = EmptyObject } } = vnode;

    if (oldOn === on) {
        return;
    }

    const { elm } = vnode;
    const { elm: oldElm } = oldVnode;
    const listener = vnode.listener = oldVnode.listener || createListener();
    listener.vnode = vnode;

    let name;
    for (name in on) {
        if (isUndefined(oldOn[name])) {
            elm.addEventListener(name, listener, false);
        }
    }
    for (name in oldOn) {
        if (isUndefined(on[name])) {
            oldElm.removeEventListener(name, listener, false);
        }
    }
}

const eventListenersModule: Module = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: removeAllEventListeners
};
export default eventListenersModule;
