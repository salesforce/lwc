import className from "./modules/klass.js";
import componentInit from "./modules/component-init.js";
import componentProps from "./modules/component-props.js";
import componentSlotset from "./modules/component-slotset.js";
import componentClassList from "./modules/component-klass.js";
import componentChildren from "./modules/component-children.js";
import props from "./modules/props.js";

import { init } from "snabbdom";
import attrs from "snabbdom/modules/attributes";
import style from "snabbdom/modules/style";
import dataset from "snabbdom/modules/dataset";
import on from "snabbdom/modules/eventlisteners";

import assert from "./assert.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import {
    destroyComponent,
    getLinkedVNode,
} from "./component.js";
import { c } from "./api.js";

export const globalRenderedCallbacks: Array<() => void> = [];

export const patch = init([
    componentInit,
    componentClassList,
    componentSlotset,
    componentProps,
    componentChildren,
    props,
    attrs,
    style,
    dataset,
    className,
    on,
]);

export function rehydrate(vm: VM) {
    assert.vm(vm);
    const { cache } = vm;
    assert.isTrue(vm.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
    if (cache.isDirty) {
        const oldVnode = getLinkedVNode(cache.component);
        const { sel, Ctor, data: { key, slotset, dataset, _props, _on, _class }, children } = oldVnode;
        assert.invariant(Array.isArray(children), 'Rendered vm ${vm}.children should always have an array of vnodes instead of ${children}');
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode with the exact same data was used
        // to patch this vm the last time, mimic what happen when the
        // owner re-renders.
        const vnode = c(sel, Ctor, {
            key,
            slotset,
            dataset,
            props: _props,
            on: _on,
            class: _class,
        });
        patch(oldVnode, vnode);
    }
    cache.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    const { cache } = vm;
    if (!cache.isScheduled) {
        cache.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail(`Error attempting to rehydrate component ${vm}: ${error.message}`);
        });
    }
}

export const lifeCycleHooks = {
    insert(vm: VM) {
        assert.vm(vm);
        if (vm.cache.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log(`vnode "${vm}" was inserted.`);
    },
    post() {
        // This hook allows us to resolve a promise after the current patching
        // process has concluded and all elements are in the DOM.
        // TODO: we don't have that user-land API just yet, but eventually we will
        // have it to support something like `element.focus()`;
        const len = globalRenderedCallbacks.length;
        for (let i = 0; i < len; i += 1) {
            const callback = globalRenderedCallbacks.shift();
            // TODO: do we need to set and restore context around this callback?
            callback();
        }
    },
    destroy(vm: VM) {
        assert.vm(vm);
        if (vm.cache.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.cache.listeners.size > 0) {
            destroyComponent(vm);
        }
        console.log(`vnode "${vm}" was destroyed.`);
    },
}
