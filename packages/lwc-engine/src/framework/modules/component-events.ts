import { isUndefined } from "../language";
import { createComponentListener } from "../component";
import { EmptyObject } from "../utils";

function removeAllCmpEventListeners(vnode: VNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { cmpEvents: on, listener } = vm;
    if (on && listener) {
        const { elm } = vnode;
        let name;
        for (name in on) {
            elm.removeEventListener(name, listener, false);
        }
        vm.listener = undefined;
    }
}

function updateCmpEventListeners(oldVnode: VNode, vnode: VNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { vm: oldVm } = oldVnode;
    if (oldVm === vm) {
        return;
    }

    const oldOn = (oldVm && oldVm.cmpEvents) || EmptyObject;
    const { cmpEvents: on = EmptyObject } = vm;

    if (oldOn === on) {
        return;
    }

    const { elm } = vnode;
    const { elm: oldElm } = oldVnode;
    const listener = vm.cmpListener = (oldVm && oldVm.cmpListener) || createComponentListener();
    listener.vm = vm;

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
    create: updateCmpEventListeners,
    update: updateCmpEventListeners,
    destroy: removeAllCmpEventListeners
};
export default eventListenersModule;
