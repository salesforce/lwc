// @flow

import {
    createComponent,
    updateComponent,
} from "./component.js";

import {
    invokeComponentAttachMethod,
    invokeComponentDetachMethod,
} from "./invoker.js";

import { updateComponentAttributes } from "./attribute.js";

function copyToThunk(vnode: Object, thunk: Object) {
    const { data: { attributes, body } } = thunk;
    thunk.elm = vnode.elm;
    thunk.data.state = vnode.data.state;
    thunk.data.component = vnode.data.component;
    thunk.data.api = vnode.data.api;
    thunk.data.offspring = vnode.data.offspring;
    thunk.toString = vnode.toString;
    // preserving the old `attributes` collection with getter/setters
    thunk.data.attributes = vnode.data.attributes;
    updateComponentAttributes(thunk, attributes, body);
}

export function init(vnode: Object) {
    const { data } = vnode;
    data.state = {
        hasBodyAttribute: false,
        isReady: false,
        isScheduled: false,
        isRendering: false,
        isDirty: false,
    };
    data.component = null;
    data.api = null;
    data.offspring = null;
    // TODO: maybe don't belong here...
    vnode.toString = (): string => {
        const type = data.Ctor ? data.Ctor.constructor.vnodeType : vnode.sel;
        return `<${type}>`;
    };
    createComponent(vnode);
}

export function prepatch(oldVnode: Object, thunk: Object) {
    const { data: { Ctor: oldCtor } } = oldVnode;
    const { data: { Ctor: newCtor } } = thunk;
    if (oldCtor !== newCtor) {
        createComponent(thunk);
    } else {
        copyToThunk(oldVnode, thunk);
        if (thunk.data.state.isDirty) {
            updateComponent(thunk);
        }
    }
}

export function insert(vnode: Object) {
    invokeComponentAttachMethod(vnode);
}

export function destroy(vnode: Object) {
    invokeComponentDetachMethod(vnode);
}
