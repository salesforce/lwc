import assert from "./assert.js";
import { getComponentDef } from "./def.js";
import {
    initComponent,
    createComponent,
} from "./component.js";
import { c } from "./api.js";
import { patch } from "./patch.js";

export function createVM(vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.invariant(vnode.elm instanceof HTMLElement, `VM creation requires a DOM element to be associated to vnode ${vnode}.`);
    const { Ctor, sel } = vnode;
    console.log(`<${Ctor.name}> is being initialized.`);
    const def = getComponentDef(Ctor);
    const vm: VM = {
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        privates: {},
        cmpProps: {},
        cmpSlots: {},
        component: undefined,
        fragment: undefined,
        listeners: new Set(),
    };
    assert.block(() => {
        vm.toString = (): string => {
            return `<${sel}>`;
        };
    });
    vnode.vm = vm;
    const vnodeBeingConstructedInception = vnodeBeingConstructed;
    vnodeBeingConstructed = vnode;
    createComponent(vm, Ctor);
    vnodeBeingConstructed = vnodeBeingConstructedInception;
    // note to self: invocations during construction to get the vnode associated
    // to the component works fine as well because we can use `vmBeingCreated`
    // in getLinkedVNode() as a fallback patch for resolution.
    setLinkedVNode(vm.component, vnode);
    // note to self: initComponent() is needed as a separate step because observable
    // attributes might invoke user-land code that can do certain things that can
    // require the linking to be in place from the previous line.
    initComponent(vm);
}

const ComponentToVNodeMap = new WeakMap();

let vnodeBeingConstructed: ComponentVNode | null = null;

export function setLinkedVNode(component: Component, vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.isTrue(vnode.elm instanceof HTMLElement, `Only DOM elements can be linked to their corresponding component.`);
    ComponentToVNodeMap.set(component, vnode);
}

export function getLinkedVNode(component: Component): ComponentVNode {
    assert.isTrue(component, `invalid component ${component}`);
    // note to self: we fallback to `vmBeingCreated` in case users
    // invoke something during the constructor execution, in which
    // case this mapping hasn't been stable yet, but we know that's
    // the only case.
    const vnode = ComponentToVNodeMap.get(component) || vnodeBeingConstructed;
    assert.vnode(vnode);
    return vnode;
}

export function rehydrate(vm: vm) {
    assert.vm(vm);
    if (vm.isDirty) {
        const oldVnode = getLinkedVNode(vm.component);
        assert.isTrue(oldVnode.elm instanceof HTMLElement, `rehydration can only happen after ${vm} was patched the first time.`);
        const { sel, Ctor, data: { key, slotset, dataset, on, _props, _class }, children } = oldVnode;
        assert.invariant(Array.isArray(children), 'Rendered ${vm}.children should always have an array of vnodes instead of ${children}');
        // when patch() is invoked from within the component life-cycle due to
        // a dirty state, we create a new VNode with the exact same data was used
        // to patch this vnode the last time, mimic what happen when the
        // owner re-renders.
        const vnode = c(sel, Ctor, {
            key,
            slotset,
            dataset,
            on,
            props: _props,
            class: _class,
        });
        patch(oldVnode, vnode);
    }
    vm.isScheduled = false;
}

export function scheduleRehydration(vm: VM) {
    assert.vm(vm);
    if (!vm.isScheduled) {
        vm.isScheduled = true;
        Promise.resolve(vm).then(rehydrate).catch((error: Error) => {
            assert.fail(`Error attempting to rehydrate component ${vm}: ${error.message}`);
        });
    }
}
