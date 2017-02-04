import assert from "./assert.js";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
} from "./invoker.js";
import { getComponentDef } from "./def.js";
import {
    isRendering,
    invokeComponentAttributeChangedCallback,
} from "./invoker.js";
import { hookComponentProperty } from "./properties.js";
import { hookComponentReflectiveProperty } from "./attributes.js";
import {
    setPrototypeOf,
    getOwnPropertyNames,
} from "./language.js";

function initComponentProps(vm: VM) {
    assert.vm(vm);
    const { cache, data: { _props } } = vm;
    const { component, def: { props: publicPropsConfig, observedAttrs } } = cache;
    // reflective properties
    for (let propName in publicPropsConfig) {
        hookComponentReflectiveProperty(vm, propName);
    }
    // non-reflective properties
    getOwnPropertyNames(component).forEach((propName: string) => {
        if (propName in publicPropsConfig) {
            return;
        }
        hookComponentProperty(vm, propName);
    });

    // notifying observable attributes if they are initialized with default or custom value
    for (let propName in publicPropsConfig) {
        const {  attrName } = publicPropsConfig[propName];
        const defaultValue = _props[propName];
        // default value is an engine abstraction, and therefore should be treated as a regular
        // attribute mutation process, and therefore notified.
        if (defaultValue !== undefined && observedAttrs[attrName]) {
            invokeComponentAttributeChangedCallback(vm, attrName, undefined, defaultValue);
        }
    }
}

function clearListeners(vm: VM) {
    assert.vm(vm);
    const { cache: { listeners } } = vm;
    listeners.forEach((propSet: Set<VM>): boolean => propSet.delete(vm));
    listeners.clear();
}

export function updateComponentProp(vm: VM, propName: string, newValue: any) {
    assert.vm(vm);
    const { cache, data: { _props } } = vm;
    const { def: { props: publicPropsConfig, observedAttrs } } = cache;
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
    let oldValue = _props[propName];
    if (oldValue !== newValue) {
        _props[propName] = newValue;
        if (config) {
            const attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log(`Marking ${vm} as dirty: property "${propName}" set to a new value.`);
        if (!cache.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function resetComponentProp(vm: VM, propName: string) {
    assert.vm(vm);
    const { cache, data: { _props } } = vm;
    const { def: { props: publicPropsConfig, observedAttrs } } = cache;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm}.${propName}`);
    const config = publicPropsConfig[propName];
    let oldValue = _props[propName];
    let newValue = undefined;
    if (!config) {
        // TODO: ignore any native html property
        console.warn(`Resetting unknown property ${propName} of ${vm}. This property will be a pass-thru to the DOM element.`);
    } else {
        const initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    if (oldValue !== newValue) {
        _props[propName] = newValue;
        if (config) {
            const attrName = config.attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        console.log(`Marking ${vm} as dirty: property "${propName}" set to its default value.`);
        if (!cache.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function updateComponentSlots(vm: VM, newSlots: Array<vnode>) {
    // TODO: in the future, we can optimize this more, and only
    // set as dirty if the component really need slots, and if the slots has changed.
    console.log(`Marking ${vm} as dirty: [slotset] value changed.`);
    if (!vm.cache.isDirty) {
        markComponentAsDirty(vm);
    }
}

export function createComponent(vm: VM) {
    assert.vm(vm);
    assert.invariant(vm.elm instanceof HTMLElement, 'Component creation requires a DOM element to be associated to it.');
    const { Ctor, sel } = vm;
    console.log(`<${Ctor.name}> is being initialized.`);
    const def = getComponentDef(Ctor);
    const cache = {
        isScheduled: false,
        isDirty: true,
        def,
        context: {},
        privates: {},
        component: null,
        fragment: undefined,
        shadowRoot: null,
        listeners: new Set(),
    };
    assert.block(() => {
        const proto = {
            toString: (): string => {
                return `<${sel}>`;
            },
        };
        setPrototypeOf(vm, proto);
    });
    vm.cache = cache;
    vm.data._props = {};
    vm.data._on = {};
    cache.component = invokeComponentConstructor(vm);
    initComponentProps(vm);
}

export function renderComponent(vm: VM) {
    assert.vm(vm);
    const { cache } = vm;
    assert.invariant(cache.isDirty, `Component ${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    cache.isDirty = false;
    cache.fragment = vnodes;
    assert.invariant(Array.isArray(vnodes), 'Render should always return an array of vnodes instead of ${children}');
}

export function destroyComponent(vm: VM) {
    assert.vm(vm);
    clearListeners(vm);
}

export function markComponentAsDirty(vm: VM) {
    assert.vm(vm);
    assert.isFalse(vm.cache.isDirty, `markComponentAsDirty(${vm}) should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markComponentAsDirty(${vm}) cannot be called during rendering.`);
    vm.cache.isDirty = true;
}
