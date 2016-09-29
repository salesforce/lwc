// @flow

// @flow

import * as baseAPI from "./api.js";
import { patch } from "./patcher.js";
import assert from "./assert.js";
import { initComponentAttributes } from "./attribute.js";
import { initComponentProperties } from "./property.js";
import {
    invokeComponentRenderMethod,
    invokeComponentUpdatedMethod,
} from "./invoker.js";

function createRenderInterface(): Object {
    var cache = new Map();
    // this object wraps the static base api plus those bits that are bound to
    // the vnode instance, so we can apply memoization for some operations.
    return Object.create(baseAPI, {
        // [m]emoized node
        m: {
            value: (key: number, value: any): any => {
                if (cache.has(key)) {
                    return cache.get(key);
                }
                cache.set(key, value);
                return value;
            },
            writable: false,
            enumerable: true,
        }
    })
}

function fold(vnode: Object, newVnode: Object) {
    vnode.sel = newVnode.sel;
    vnode.data.props = newVnode.data.props;
    vnode.data.attrs = newVnode.data.attrs;
    vnode.data.on = newVnode.data.on;
    vnode.children = newVnode.children;
    vnode.text = newVnode.text;
    vnode.elm = newVnode.elm;
}

export function createComponent(vnode: Object) {
    const { data } = vnode;
    data.api = createRenderInterface();
    const { attributes, Ctor, body, state } = data;
    data.component = new Ctor();
    initComponentAttributes(vnode, attributes, body);
    initComponentProperties(vnode);
    invokeComponentUpdatedMethod(vnode);
    let newVnode = invokeComponentRenderMethod(vnode);
    data.offspring = newVnode;
    state.isReady = true;
    fold(vnode, newVnode);
}

export function updateComponent(vnode: Object) {
    const { data } = vnode;
    const { state, offspring: oldVnode } = data;
    assert.invariant(oldVnode, `Component ${vnode} does not have an offspring yet.`);
    assert.invariant(state.isReady, `Component ${vnode} is not ready to be updated.`);
    assert.invariant(state.isScheduled, `Component ${vnode} is not scheduled to be updated.`);
    assert.invariant(state.isDirty, `Component ${vnode} is not dirty.`);
    invokeComponentUpdatedMethod(vnode);
    const newVnode = invokeComponentRenderMethod(vnode);
    data.offspring = patch(oldVnode, newVnode);
    state.isScheduled = false;
    state.isDirty = false;
    fold(vnode, newVnode);
}
