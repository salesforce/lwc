import assert from "./assert.js";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isRendering,
    vmBeingRendered,
    invokeComponentAttributeChangedCallback,
    invokeComponentRenderedCallback,
    invokeComponentMethod,
} from "./invoker.js";
import { notifyListeners } from "./watcher.js";
import { isArray, isUndefined, create, toString, ArrayIndexOf, ArrayPush, ArraySplice } from "./language.js";
import { addCallbackToNextTick, getAttrNameFromPropName } from "./utils.js";
import { extractOwnFields, getPropertyProxy } from "./properties.js";

export function createComponent(vm: VM, Ctor: Class<Component>) {
    assert.vm(vm);
    const { cmpProps, def: { methods: publicMethodsConfig } } = vm;
    // expose public methods as props on the Element
    for (let methodName in publicMethodsConfig) {
        cmpProps[methodName] = function (): any {
            return invokeComponentMethod(vm, methodName, arguments)
        };
    }
    // create the component instance
    const component = invokeComponentConstructor(vm, Ctor);
    assert.block(function devModeCheck() {
        extractOwnFields(component);
    });
    vm.component = component;
}

export function clearListeners(vm: VM) {
    assert.vm(vm);
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
            ArraySplice.call(set, pos, 1);
        }
        deps.length = 0;
    }
}

export function updateComponentProp(vm: VM, propName: string, newValue: any) {
    assert.vm(vm);
    const { cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`);
    const config: PropDef = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // TODO: this should never really happen because the compiler should always validate
        console.warn(`Ignoreing unknown public property ${propName} of ${vm}. This is probably a typo on the corresponding attribute "${getAttrNameFromPropName(propName)}".`);
        return;
    }
    let oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        assert.block(function devModeCheck() {
            if (typeof newValue === 'object') {
                assert.invariant(getPropertyProxy(newValue) === newValue, `updateComponentProp() should always received proxified object values instead of ${newValue} in ${vm}.`);
            }
        });
        cmpProps[propName] = newValue;
        const attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
    }
}

export function resetComponentProp(vm: VM, propName: string) {
    assert.vm(vm);
    const { cmpProps, def: { props: publicPropsConfig, observedAttrs } } = vm;
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`);
    const config: PropDef = publicPropsConfig[propName];
    if (isUndefined(config)) {
        // not need to log the error here because we will do it on updateComponentProp()
        return;
    }
    let oldValue = cmpProps[propName];
    let newValue = undefined;
    if (oldValue !== newValue) {
        cmpProps[propName] = newValue;
        const attrName = getAttrNameFromPropName(propName);
        if (attrName in observedAttrs) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
        notifyListeners(cmpProps, propName);
    }
}

export function addComponentEventListener(vm: VM, eventName: string, newHandler: EventListener) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
    let { cmpEvents } = vm;
    if (isUndefined(cmpEvents)) {
        vm.cmpEvents = cmpEvents = create(null);
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
    }
    assert.block(function devModeCheck() {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            console.warn(`Adding the same event listener ${newHandler} for the event "${eventName}" will result on calling the same handler multiple times for ${vm}. In most cases, this is an issue, instead, you can add the event listener in the constructor(), which is guarantee to be executed only once during the life-cycle of the component ${vm}.`);
        }
    });
    // TODO: we might need to hook into this listener for Locker Service
    ArrayPush.call(cmpEvents[eventName], newHandler);
    console.log(`Marking ${vm} as dirty: event handler for "${eventName}" has been added.`);
    if (!vm.isDirty) {
        markComponentAsDirty(vm);
    }
}

export function removeComponentEventListener(vm: VM, eventName: string, oldHandler: EventListener) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by removing an event listener for "${eventName}".`);
    const { cmpEvents } = vm;
    if (cmpEvents) {
        const handlers = cmpEvents[eventName];
        const pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            ArraySplice.call(cmpEvents[eventName], pos, 1);
            if (!vm.isDirty) {
                markComponentAsDirty(vm);
            }
            return;
        }
    }
    assert.block(function devModeCheck() {
        console.warn(`Event handler ${oldHandler} not found for event "${eventName}", this is an unneccessary operation. Only attempt to remove the event handlers that you have added already for ${vm}.`);
    });
}

export function addComponentSlot(vm: VM, slotName: string, newValue: Array<VNode>) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
    assert.isTrue(isArray(newValue) && newValue.length > 0, `Slots can only be set to a non-empty array, instead received ${toString(newValue)} for slot ${slotName} in ${vm}.`)
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
            vm.cmpSlots = cmpSlots = create(null);
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
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of slot ${slotName} in ${vm}`);
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
    assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    vm.isDirty = true;
}
