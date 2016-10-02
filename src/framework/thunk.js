// @flow

import {
    createComponent,
    updateComponent,
} from "./component.js";

import {
    invokeComponentAttachMethod,
    invokeComponentDetachMethod,
} from "./invoker.js";

import assert from "./assert.js";

import { updateComponentAttributes } from "./attribute.js";

function initVnodeFromOldVnode(vnode: Object, oldVnode: Object) {
    const { hasBodyAttribute, isReady, isScheduled, isRendering, isDirty, component, api, offspring, toString, body, state, children, data } = oldVnode;
    vnode.data = data;
    vnode.state = state;
    vnode.body = body;
    vnode.hasBodyAttribute = hasBodyAttribute;
    vnode.isReady = isReady;
    vnode.isScheduled = isScheduled;
    vnode.isRendering = isRendering;
    vnode.isDirty = isDirty;
    vnode.component = component;
    vnode.api = api;
    vnode.offspring = offspring;
    vnode.toString = toString;
    vnode.children = children;
}

function initVnodeFromScratch(vnode: Object) {
    const { data, children: body } = vnode;
    const { props: state = {} } = data;
    const emptyVnode = {
        state,
        body,
        data,
        hasBodyAttribute: false,
        isReady: false,
        isScheduled: false,
        isRendering: false,
        isDirty: false,
        component: null,
        api: null,
        offspring: null,
        // TODO: maybe don't belong here...
        toString: (): string => {
            const type = vnode.Ctor ? vnode.Ctor.constructor.vnodeType : vnode.sel;
            return `<${type}>`;
        },
    };
    initVnodeFromOldVnode(vnode, emptyVnode);
    vnode.data.props = undefined;
}

export function init(vnode: Object) {
    initVnodeFromScratch(vnode);
    createComponent(vnode);
}

export function prepatch(oldVnode: Object, thunk: Object) {
    const { Ctor: oldCtor } = oldVnode;
    const { Ctor, api, data: { props: state }, children: body } = thunk;
    if (oldVnode !== thunk) {
        if (oldCtor !== Ctor) {
            createComponent(thunk);
        } else {
            if (api === undefined) {
                initVnodeFromOldVnode(thunk, oldVnode);
            }
            updateComponentAttributes(thunk, state, body);
            if (thunk.isDirty) {
                updateComponent(thunk);
            }
        }
    }
}

export function insert(vnode: Object) {
    const { offspring } = vnode;
    assert.vnode(offspring, 'The insert hook in a Component cannot be called if there is not an offspring.');
    offspring.elm = vnode.elm;
    const { data: { hook: subHook } } = offspring;
    if (subHook && subHook.insert === insert) {
        insert(offspring);
    }
    invokeComponentAttachMethod(vnode);
}

export function destroy(vnode: Object) {
    const { offspring } = vnode;
    assert.vnode(offspring, 'The destroy hook in a Component cannot be called if there is not an offspring.');
    const { data: { hook: subHook } } = offspring;
    if (subHook && subHook.destroy === destroy) {
        destroy(offspring);
    }
    invokeComponentDetachMethod(vnode);
    vnode.offspring = null;
}
