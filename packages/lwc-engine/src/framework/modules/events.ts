import { isUndefined } from "../../shared/language";
import { VNode, Module } from "../../3rdparty/snabbdom/types";

function handleEvent(event: Event, vnode: VNode) {
    const { type } = event;
    const { data: { on } } = vnode;
    const handler = on && on[type];
    // call event handler if exists
    if (handler) {
        handler.call(undefined, event);
    }
}

interface VNodeEventListenerContext {
    vnode: VNode;
    listener: EventListener;
}

function createListenerContext(vnode: VNode): VNodeEventListenerContext {
    const context: VNodeEventListenerContext = {
        vnode,
        listener: function handler(event: Event) {
            handleEvent(event, context.vnode);
        }
    };
    return context;
}

function removeAllEventListeners(vnode: VNode) {
    const { data: { on, listenerContext } } = vnode;
    if (on && listenerContext) {
        const elm = vnode.elm as Element;
        let name;
        for (name in on) {
            elm.removeEventListener(name, listenerContext.listener);
        }
        vnode.data.listenerContext = undefined;
    }
}

function updateAllEventListeners(oldVnode: VNode, vnode: VNode) {
    if (isUndefined(oldVnode.data.listenerContext)) {
        createAllEventListeners(oldVnode, vnode);
    } else {
        vnode.data.listenerContext = oldVnode.data.listenerContext;
        vnode.data.listenerContext.vnode = vnode;
    }
}

function createAllEventListeners(oldVnode: VNode, vnode: VNode) {
    const { data: { on } } = vnode;
    if (isUndefined(on)) {
        return;
    }
    const elm = vnode.elm as Element;
    const { listener } = vnode.data.listenerContext = createListenerContext(vnode);

    let name;
    for (name in on) {
        elm.addEventListener(name, listener);
    }
}

const eventListenersModule: Module = {
    update: updateAllEventListeners,
    create: createAllEventListeners,
    destroy: removeAllEventListeners
};
export default eventListenersModule;
