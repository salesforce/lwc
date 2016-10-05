// @flow

///<reference path="types.d.ts"/>

import * as baseAPI from "./api.js";
import { patch } from "./patcher.js";
import assert from "./assert.js";
import { initComponentAttributes } from "./attribute.js";
import { initComponentProperties } from "./property.js";
import {
    invokeComponentRenderMethod,
    invokeComponentUpdatedMethod,
} from "./invoker.js";

function createRenderInterface(): RenderAPI {
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

// at this point, the child vnode is ready, and all possible bits that are
// needed by the engine to render the element, should be propagated from
// the vnode to the parent vm, we call this the folding process.
function foldVnode(vm: VM, vnode: VNode) {
    const { sel, children, text, data } = vnode;
    vm.sel = sel;
    vm.children = children;
    vm.text = text;
    Object.assign(vm.data, data);
}

export function createComponent(vm: VM) {
    const { Ctor, state, body } = vm;
    vm.api = createRenderInterface();
    vm.component = new Ctor();
    initComponentAttributes(vm, state, body);
    initComponentProperties(vm);
    invokeComponentUpdatedMethod(vm);
    let vnode = invokeComponentRenderMethod(vm);
    vm.vnode = vnode;
    vm.isReady = true;
    foldVnode(vm, vnode);
}

export function updateComponent(vm: VM) {
    const { isDirty, isReady, vnode } = vm;
    assert.invariant(vnode, `Component ${vm} does not have a child vnode yet.`);
    assert.invariant(isReady, `Component ${vm} is not ready to be updated.`);
    assert.invariant(isDirty, `Component ${vm} is not dirty.`);
    // TODO: what about null results from render?
    let newVnode = invokeComponentRenderMethod(vm);
    newVnode = patch(vnode, newVnode);
    vm.vnode = newVnode;
    vm.isDirty = false;
    foldVnode(vm, newVnode);
}

export function initFromScratch(vm: VM) {
    const { data, children: body } = vm;
    const { props: state = {} } = data;
    const emptyvm = {
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
        vnode: null,
        reactiveNames: {},
        // TODO: maybe don't belong here...
        toString: (): string => {
            const type = vm.Ctor ? vm.Ctor.constructor.vnodeType : vm.sel;
            return `<${type}>`;
        },
    };
    initFromAnotherVM(vm, emptyvm);
    vm.data.props = undefined;
}

export function initFromAnotherVM(vm: VM, oldvm: VM) {
    const { hasBodyAttribute, isReady, isScheduled, isRendering, isDirty, component, api, vnode, toString, body, state, children, data, reactiveNames } = oldvm;
    vm.data = data;
    vm.state = state;
    vm.body = body;
    vm.hasBodyAttribute = hasBodyAttribute;
    vm.isReady = isReady;
    vm.isScheduled = isScheduled;
    vm.isRendering = isRendering;
    vm.isDirty = isDirty;
    vm.component = component;
    vm.api = api;
    vm.vnode = vnode;
    vm.reactiveNames = reactiveNames;
    vm.toString = toString;
    vm.children = children;
}
