import assert from "./assert.js";
import { subscribeToSetHook } from "./watcher.js";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
} from "./invoker.js";
import {
    internal,
} from "./def.js";
import {
    isRendering,
    vmBeingRendered,
    invokeComponentAttributeChangedCallback,
    invokeComponentRenderedCallback,
} from "./invoker.js";
import {
    hookComponentLocalProperty,
    getPropertyProxy,
} from "./properties.js";

import {
    defineProperty,
    getPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
} from "./language.js";

const renderedDuringCurrentCycleSet = new Set();

function hookComponentReflectiveProperty(vm: VM, propName: string) {
    const { component, cmpProps, def: { props: publicPropsConfig } } = vm;
    assert.block(() => {
        const target = getPrototypeOf(component);
        const { get, set } = getOwnPropertyDescriptor(component, propName) || getOwnPropertyDescriptor(target, propName);
        assert.invariant(get[internal] && set[internal], `component ${vm} has tampered with property ${propName} during construction.`);
    });
    defineProperty(component, propName, {
        get: (): any => {
            const value = cmpProps[propName];
            if (isRendering && vmBeingRendered) {
                subscribeToSetHook(vmBeingRendered, cmpProps, propName);
            }
            return (value && typeof value === 'object') ? getPropertyProxy(value) : value;
        },
        set: (newValue: any) => {
            assert.invariant(false, `Property ${propName} of ${vm} cannot be set to ${newValue} because it is a public property controlled by the owner element.`);
        },
        configurable: true,
        enumerable: true,
    });
    // this guarantees that the default value is always in place before anything else.
    const { initializer } = publicPropsConfig[propName];
    const defaultValue = typeof initializer === 'function' ? initializer(): initializer;
    cmpProps[propName] = defaultValue;
}

export function createComponent(vm: VM, Ctor: Class<Component>) {
    assert.vm(vm);
    vm.component = invokeComponentConstructor(vm, Ctor);
}

export function initComponent(vm: VM) {
    assert.vm(vm);
    const { component, cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    // reflective properties
    for (let propName in publicPropsConfig) {
        hookComponentReflectiveProperty(vm, propName);
    }
    // non-reflective properties
    getOwnPropertyNames(component).forEach((propName: string) => {
        if (propName in publicPropsConfig) {
            return;
        }
        hookComponentLocalProperty(vm, propName);
    });

    // notifying observable attributes if they are initialized with default or custom value
    for (let propName in publicPropsConfig) {
        const {  attrName } = publicPropsConfig[propName];
        const defaultValue = cmpProps[propName];
        // default value is an engine abstraction, and therefore should be treated as a regular
        // attribute mutation process, and therefore notified.
        if (defaultValue !== undefined && observedAttrs[attrName]) {
            invokeComponentAttributeChangedCallback(vm, attrName, undefined, defaultValue);
        }
    }
}

export function clearListeners(vm: VM) {
    assert.vm(vm);
    const { listeners } = vm;
    listeners.forEach((propSet: Set<VM>): boolean => propSet.delete(vm));
    listeners.clear();
}

export function updateComponentProp(vm: VM, propName: string, newValue: any) {
    assert.vm(vm);
    const { cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm}.${propName}`);
    const config = publicPropsConfig[propName];
    if (!config) {
        // TODO: ignore any native html property
        console.warn(`Updating unknown property ${propName} of ${vm}. This property will be a pass-thru to the DOM element.`);
    }
    if (newValue === undefined && config) {
        // default prop value computed when needed
        const initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    let oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        if (config) {
            const attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log(`Marking ${vm} as dirty: property "${propName}" set to a new value.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function resetComponentProp(vm: VM, propName: string) {
    assert.vm(vm);
    const { cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm}.${propName}`);
    const config = publicPropsConfig[propName];
    let oldValue = cmpProps[propName];
    let newValue = undefined;
    if (!config) {
        // TODO: ignore any native html property
        console.warn(`Resetting unknown property ${propName} of ${vm}. This property will be a pass-thru to the DOM element.`);
    } else {
        const initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        if (config) {
            const attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log(`Marking ${vm} as dirty: property "${propName}" set to its default value.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function updateComponentSlots(vm: VM, slotset: HashTable<Array<VNode>>) {
    assert.vm(vm);
    // TODO: in the future, we can optimize this more, and only
    // set as dirty if the component really need slots, and if the slots has changed.
    console.log(`Marking ${vm} as dirty: [slotset] value changed.`);
    if (slotset !== vm.cmpSlots) {
        vm.cmpSlots = slotset || {};
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function renderComponent(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.isDirty, `Component ${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    vm.fragment = vnodes;
    assert.invariant(Array.isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    // preparing for the after rendering
    renderedDuringCurrentCycleSet.add(vm);
}

export function markComponentAsDirty(vm: VM) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering.`);
    vm.isDirty = true;
}

export function markAllComponentAsRendered() {
    /**
     * In this method we invoke the renderedCallback() on any component
     * that was rendered during this last patching cycle.
    */
    const pending = Array.from(renderedDuringCurrentCycleSet);
    const len = pending.length;
    renderedDuringCurrentCycleSet.clear();
    for (let i = 0; i < len; i += 1) {
        const vm = pending.shift();
        invokeComponentRenderedCallback(vm);
    }
}
