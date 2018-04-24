import { isUndefined } from "../language";
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { addEventListener, removeEventListener } from "../dom";

function handleEvent(event: Event, vnode: VNode) {
    const { type } = event;
    const { data: { on } } = vnode;
    const handler = on && on[type];
    // call event handler if exists
    if (handler) {
        handler.call(undefined, event);
    }
}

interface VNodeEventListener extends EventListener {
    vnode?: VNode;
}

interface InteractiveVNode extends VNode {
    listener: VNodeEventListener | undefined;
}

function createListener(): EventListener {
    return function handler(event: Event) {
        handleEvent(event, (handler as VNodeEventListener).vnode as VNode);
    };
}

function removeAllEventListeners(vnode: InteractiveVNode) {
    const { data: { on }, listener } = vnode;
    if (on && listener) {
        const elm = vnode.elm as Element;
        let name;
        for (name in on) {
            removeEventListener.call(elm, name, listener, false);
        }
        vnode.listener = undefined;
    }
}

function updateAllEventListeners(oldVnode: InteractiveVNode, vnode: InteractiveVNode) {
    if (isUndefined(oldVnode.listener)) {
        createAllEventListeners(oldVnode, vnode);
    } else {
        vnode.listener = oldVnode.listener;
        vnode.listener.vnode = vnode;
    }
}

function createAllEventListeners(oldVnode: InteractiveVNode, vnode: InteractiveVNode) {
    const { data: { on } } = vnode;
    if (isUndefined(on)) {
        return;
    }
    const elm = vnode.elm as Element;
    const listener: VNodeEventListener = vnode.listener = createListener();
    listener.vnode = vnode;

    let name;
    for (name in on) {
        addEventListener.call(elm, name, listener, false);
    }
}

// @ts-ignore
const eventListenersModule: Module = {
    update: updateAllEventListeners,
    create: createAllEventListeners,
    destroy: removeAllEventListeners
};
export default eventListenersModule;
