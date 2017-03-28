import assert from "./assert.js";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
} from "./invoker.js";
import {
    isRendering,
    invokeComponentAttributeChangedCallback,
    invokeComponentRenderedCallback,
    invokeComponentMethod,
} from "./invoker.js";
import {
    isArray,
    isUndefined,
} from "./language.js";
import { addCallbackToNextTick, getAttrNameFromPropName } from "./utils.js";

export function createComponent(vm: VM, Ctor: Class<Component>) {
    assert.vm(vm);
    // setting the default values for public props
    // TODO: we can remove this initialization once the compiler does the initialization
    // in the constructor.
    const { cmpProps, def: { props: publicPropsConfig, methods: publicMethodsConfig } } = vm;
    // reflective properties
    for (let propName in publicPropsConfig) {
        const { cmpProps, def: { props: publicPropsConfig } } = vm;
        // this guarantees that the default value is always in place before anything else.
        const config: PropDef = publicPropsConfig[propName];
        cmpProps[propName] = getDefaultValueFromConfig(config);
    }
    // expose public methods as props on the Element
    for (let methodName in publicMethodsConfig) {
        cmpProps[methodName] = (...args: any): any => invokeComponentMethod(vm, methodName, args);
    }
    // create the component instance
    const component = invokeComponentConstructor(vm, Ctor);
    // TODO: in dev-mode, we should freeze the component object, but can we make a more descriptive error when devs attempt to mutate something
    vm.component = component;
}

export function clearListeners(vm: VM) {
    assert.vm(vm);
    const { listeners } = vm;
    listeners.forEach((propSet: Set<VM>): boolean => propSet.delete(vm));
    listeners.clear();
}

function getDefaultValueFromConfig({ initializer }: PropDef): any {
    // default prop value computed when needed
    return typeof initializer === 'function' ? initializer() : initializer;
}

export function updateComponentProp(vm: VM, propName: string, newValue: any) {
    assert.vm(vm);
    const { cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm}.${propName}`);
    const config: PropDef = publicPropsConfig[propName];
    if (isUndefined(newValue) && config) {
        newValue = getDefaultValueFromConfig(config);
    }
    let oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        const attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
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
    const config: PropDef = publicPropsConfig[propName];
    let oldValue = cmpProps[propName];
    let newValue = undefined;
    if (config) {
        newValue = getDefaultValueFromConfig(config);
    }
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        const attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        console.log(`Marking ${vm} as dirty: property "${propName}" set to its default value.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function addComponentEventListener(vm: VM, eventName: string, newHandler: EventListener) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
    let { cmpEvents } = vm;
    if (isUndefined(cmpEvents)) {
        vm.cmpEvents = cmpEvents = {};
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
    }
    assert.block(() => {
        if (cmpEvents[eventName] && cmpEvents[eventName].indexOf(newHandler) !== -1) {
            console.warn(`Adding the same event listener ${newHandler} for the event "${eventName}" will result on calling the same handler multiple times for ${vm}. In most cases, this is an issue, instead, you can add the event listener in the constructor(), which is guarantee to be executed only once during the life-cycle of the component ${vm}.`);
        }
    });
    // TODO: we might need to hook into this listener for Locker Service
    cmpEvents[eventName].push(newHandler);
    console.log(`Marking ${vm} as dirty: event handler for "${eventName}" has been added.`);
    if (!vm.isDirty) {
        markComponentAsDirty(vm);
    }
}

export function removeComponentEventListener(vm: VM, eventName: string, oldHandler: EventListener) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm} by removing an event listener for "${eventName}".`);
    const { cmpEvents } = vm;
    if (cmpEvents) {
        const listeners = cmpEvents[eventName];
        const pos = listeners && listeners.indexOf(oldHandler);
        if (listeners && pos > -1) {
            cmpEvents[eventName].splice(pos, 1);
            if (!vm.isDirty) {
                markComponentAsDirty(vm);
            }
            return;
        }
    }
    assert.block(() => {
        console.warn(`Event listener ${oldHandler} not found for event "${eventName}", this is an unneccessary operation. Only attempt to remove the listeners that you have added already for ${vm}.`);
    });
}

export function addComponentSlot(vm: VM, slotName: string, newValue: Array<VNode>) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
    assert.isTrue(isArray(newValue) && newValue.length > 0, `Slots can only be set to a non-empty array, instead received ${newValue} for slot ${slotName} in ${vm}.`)
    let { cmpSlots } = vm;
    let oldValue = cmpSlots && cmpSlots[slotName];
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.

    // TODO: Issue #133
    if (!isArray(newValue)) {
        newValue = undefined;
    }
    if (oldValue !== newValue) {
        if (isUndefined(cmpSlots)) {
            vm.cmpSlots = cmpSlots = {};
        }
        cmpSlots[slotName] = newValue;
        console.log(`Marking ${vm} as dirty: a new value for slot "${slotName}" was added.`);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
        }
    }
}

export function removeComponentSlot(vm: VM, slotName: string) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
    // TODO: hot-slots names are those slots used during the last rendering cycle, and only if
    // one of those is changed, the vm should be marked as dirty.
    const { cmpSlots } = vm;
    if (cmpSlots && cmpSlots[slotName]) {
        cmpSlots[slotName] = undefined; // delete will de-opt the cmpSlots, better to set it to undefined
        console.log(`Marking ${vm} as dirty: the value of slot "${slotName}" was removed.`);
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
    assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    if (vm.component.renderedCallback) {
        addCallbackToNextTick((): void => invokeComponentRenderedCallback(vm));
    }
}

export function markComponentAsDirty(vm: VM) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering.`);
    vm.isDirty = true;
}
