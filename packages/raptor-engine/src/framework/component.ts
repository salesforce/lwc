import assert from "./assert";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isRendering,
    vmBeingRendered,
    invokeComponentAttributeChangedCallback,
    invokeComponentMethod,
    invokeComponentCallback,
} from "./invoker";
import { notifyListeners } from "./watcher";
import { isArray, isUndefined, create, toString, ArrayPush, ArrayIndexOf, ArraySplice, isObject } from "./language";
import { addCallbackToNextTick, getAttrNameFromPropName, noop } from "./utils";
import { extractOwnFields, getPropertyProxy } from "./properties";
import { invokeServiceHook, Services } from "./services";

export let vmBeingConstructed: VM | null = null;

export function isBeingConstructed(vm: VM): boolean {
    assert.vm(vm);
    return vmBeingConstructed === vm;
}

export function createComponent(vm: VM, Ctor: Class<Component>) {
    assert.vm(vm);
    const { cmpProps, def: { wire, methods: publicMethodsConfig } } = vm;
    // expose public methods as props on the Element
    for (let methodName in publicMethodsConfig) {
        cmpProps[methodName] = function (): any {
            return invokeComponentMethod(vm, methodName, arguments)
        };
    }
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;
    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;
    assert.block(function devModeCheck() {
        extractOwnFields(component);
    });
    assert.isTrue(vm.component === component, `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
    if (wire) {
        const { wiring } = Services;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
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
        console.warn(`Ignoring unknown public property ${propName} of ${vm}. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(propName)}".`);
        return;
    }
    let oldValue = cmpProps[propName];
    if (oldValue !== newValue) {
        assert.block(function devModeCheck() {
            if (isObject(newValue)) {
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

export function createComponentListener(): EventListener {
    return function handler(event: Event) {
        dispatchComponentEvent(handler.vm, event);
    }
}

export function addComponentEventListener(vm: VM, eventName: string, newHandler: EventListener) {
    assert.vm(vm);
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
    let { cmpEvents, cmpListener } = vm;
    if (isUndefined(cmpEvents)) {
        // this piece of code must be in sync with modules/component-events
        vm.cmpEvents = cmpEvents = create(null);
        vm.cmpListener = cmpListener = createComponentListener();
        cmpListener.vm = vm;
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
        // this is not only an optimization, it is also needed to avoid adding the same
        // listener twice when the initial diffing algo kicks in without an old vm to track
        // what was already added to the DOM.
        if (!vm.isDirty) {
            // if the element is already in the DOM and rendered, we intentionally make a sync mutation
            // here and also keep track of the mutation for a possible rehydration later on without having
            // to rehydrate just now.
            const { vnode: { elm } } = vm;
            elm.addEventListener(eventName, cmpListener, false);
        }
    }
    assert.block(function devModeCheck() {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            assert.logWarning(`${vm} has duplicate listeners for event "${eventName}". Instead add the event listener in the connectedCallback() hook.`);
        }
    });
    ArrayPush.call(cmpEvents[eventName], newHandler);
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
            return;
        }
    }
    assert.block(function devModeCheck() {
        assert.logWarning(`Did not find event listener ${oldHandler} for event "${eventName}" on ${vm}. Instead only remove an event listener once.`);
    });
}

export function dispatchComponentEvent(vm: VM, event: Event): boolean {
    assert.vm(vm);
    assert.invariant(event instanceof Event, `dispatchComponentEvent() must receive an event instead of ${event}`);
    const { cmpEvents, component } = vm;
    const { type } = event;
    assert.invariant(cmpEvents && cmpEvents[type] && cmpEvents[type].length, `dispatchComponentEvent() should only be invoked if there is at least one listener in queue for ${type} on ${vm}.`);
    const handlers = cmpEvents[type];
    let uninterrupted = true;
    const { stopImmediatePropagation } = event;
    event.stopImmediatePropagation = function() {
        uninterrupted = false;
        stopImmediatePropagation.call(this);
    }
    for (let i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(vm, handlers[i], component, [event]);
    }
    // restoring original methods
    event.stopImmediatePropagation = stopImmediatePropagation;
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
    assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    console.log(`${vm} is being updated.`);
    clearListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;
    vm.fragment = vnodes;
    assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    const { component: { renderedCallback } } = vm;
    if (renderedCallback && renderedCallback !== noop) {
        addCallbackToNextTick((): void => invokeComponentMethod(vm, 'renderedCallback'));
    }
    const { rehydrated } = Services;
    if (rehydrated) {
        addCallbackToNextTick((): void => invokeServiceHook(vm, rehydrated));
    }
}

export function markComponentAsDirty(vm: VM) {
    assert.vm(vm);
    assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    vm.isDirty = true;
}
