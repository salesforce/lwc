import { create } from "../language.js";
import { dispatchComponentEvent } from "../component.js";
import { EmptyObject } from "../utils.js";

function handleEvent(event: Event, vnode: VNode) {
    const { type } = event;
    const { data: { on }, vm } = vnode;

    let uninterrupted = true;
    if (vm && vm.cmpEvents && vm.cmpEvents[type]) {
        try {
        uninterrupted = dispatchComponentEvent(vm, event);
        } catch(e) {
            console.log(e);
        }
    }

    // call event handler if exists
    if (on && on[type] && uninterrupted) {
        on[type].call(undefined, event);
    }
}

function createListener(): EventListener {
    return function handler(event: Event) {
        handleEvent(event, handler.vnode);
    }
}

function removeAllEventListeners(vnode: VNode) {
    const { data: { eventNames }, listener } = vnode;
    // remove existing listeners
    if (eventNames && listener) {
        const { elm } = vnode;
        for (let name in eventNames) {
            // remove listener if element was changed or existing listeners removed
            elm.removeEventListener(name, listener, false);
        }
        vnode.listener = undefined;
    }
}

function updateEventListeners(oldVnode: VNode, vnode: VNode) {
    const { data: { eventNames: oldEventNames = EmptyObject } } = oldVnode;
    const { data: { on = EmptyObject }, vm } = vnode;
    const cmpEvents = vm && vm.cmpEvents || EmptyObject;

    if (oldEventNames === EmptyObject && on === EmptyObject && cmpEvents === EmptyObject) {
        return;
    }

    const { elm } = vnode;
    const { listener: oldListener, elm: oldElm } = oldVnode;
    const listener = vnode.listener = oldListener || createListener();
    listener.vnode = vnode;
    const eventNames = vnode.data.eventNames = create(null);

    let name;
    for (name in on) {
        eventNames[name] = 1;
        if (oldEventNames[name] !== 1) {
            elm.addEventListener(name, listener, false);
        }
    }
    for (name in cmpEvents) {
        if (cmpEvents[name] && eventNames[name] !== 1) {
            eventNames[name] = 1;
            if (oldEventNames[name] !== 1) {
                elm.addEventListener(name, listener, false);
            }
        }
    }
    for (name in oldEventNames) {
        if (eventNames[name] !== 1) {
            oldElm.removeEventListener(name, oldListener, false);
        }
    }
}

const eventListenersModule: Module = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: removeAllEventListeners
};
export default eventListenersModule;
