import className from "./modules/klass.js";
import componentInit from "./modules/component-init.js";
import componentState from "./modules/component-state.js";
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
    renderComponent,
    destroyComponent,
} from "./component.js";

export const patch = init([
    componentInit,
    componentState,
    componentClassList,
    componentSlotset,
    componentChildren,
    componentProps,
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
        const { sel, key, elm, data, children } = vm;
        assert.invariant(Array.isArray(children), 'Rendered vm ${vm}.children should always have an array of vnodes instead of ${children}');
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new disposable VNode to kick in the diff, but the
        // data is the same, only the children collection should not be ===.
        const vnode = {
            sel,
            key,
            elm,
            data,
            children,
        };
        // rendering the component to compute the new fragment collection
        // while resetting the vm.children collection to allow diffing.
        renderComponent(vm);
        vm.children = [];
        patch(vnode, vm);
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
