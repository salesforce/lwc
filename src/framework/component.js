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

// at this point, the offspring is ready, and all possible bits that are
// needed by the engine to render the element, should be propagated from
// the offspring to its parent, we call this the folding process.
function foldOffspring(vnode: Object, offspring: Object) {
    const { sel, children, text, data } = offspring;
    vnode.sel = sel;
    vnode.children = children;
    vnode.text = text;
    Object.assign(vnode.data, data);
}

export function createComponent(vnode: Object) {
    const { Ctor, state, body } = vnode;
    vnode.api = createRenderInterface();
    vnode.component = new Ctor();
    initComponentAttributes(vnode, state, body);
    initComponentProperties(vnode);
    invokeComponentUpdatedMethod(vnode);
    let newVnode = invokeComponentRenderMethod(vnode);
    vnode.offspring = newVnode;
    vnode.isReady = true;
    foldOffspring(vnode, newVnode);
}

export function updateComponent(vnode: Object) {
    const { isDirty, isReady, offspring } = vnode;
    assert.invariant(offspring, `Component ${vnode} does not have an offspring yet.`);
    assert.invariant(isReady, `Component ${vnode} is not ready to be updated.`);
    assert.invariant(isDirty, `Component ${vnode} is not dirty.`);
    invokeComponentUpdatedMethod(vnode);
    // TODO: what about null results from render?
    let newVnode = invokeComponentRenderMethod(vnode);
    newVnode = patch(offspring, newVnode);
    vnode.offspring = newVnode;
    vnode.isScheduled = false;
    vnode.isDirty = false;
    foldOffspring(vnode, newVnode);
}
