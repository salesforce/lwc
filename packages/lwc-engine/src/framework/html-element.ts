import assert from "./assert";
import { Component, getWrappedComponentsListener } from "./component";
import { isObject, getOwnPropertyNames, ArraySlice, isNull, isTrue, create, setPrototypeOf, isFalse, defineProperties } from "./language";
import { ViewModelReflection, PatchedFlag, setInternalField } from "./utils";
import { vmBeingConstructed, isBeingConstructed, isRendering, vmBeingRendered } from "./invoker";
import { getComponentVM, VM, getCustomElementVM } from "./vm";
import { ArrayReduce, isFunction } from "./language";
import { observeMutation, notifyMutation } from "./watcher";
import { dispatchEvent, BaseCustomElementProto } from "./dom-api";
import { patchComponentWithRestrictions, patchCustomElementWithRestrictions, patchShadowRootWithRestrictions } from "./restrictions";
import { lightDomQuerySelectorAll, lightDomQuerySelector } from "./dom/faux";
import { prepareForValidAttributeMutation } from "./restrictions";

const GlobalEvent = Event; // caching global reference to avoid poisoning

export function getHostShadowRoot(elm: HTMLElement): ShadowRoot | null {
    const vm = getCustomElementVM(elm);
    return vm.mode === 'open' ? vm.cmpRoot : null;
}

function getHTMLPropDescriptor(propName: string, descriptor: PropertyDescriptor) {
    const { get, set, enumerable, configurable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard getter.`);
        }
        throw new TypeError();
    }
    if (!isFunction(set)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard setter.`);
        }
        throw new TypeError();
    }
    return {
        enumerable,
        configurable,
        get(this: Component) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.logError(`${vm} constructor should not read the value of property "${propName}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
                }
                return;
            }
            observeMutation(this, propName);
            return get.call(vm.elm);
        },
        set(this: Component, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`);
                assert.isFalse(isBeingConstructed(vm), `Failed to construct '${this}': The result must not have attributes.`);
                assert.invariant(!isObject(newValue) || isNull(newValue), `Invalid value "${newValue}" for "${propName}" of ${vm}. Value cannot be an object, must be a primitive value.`);
            }

            if (newValue !== vm.cmpProps[propName]) {
                vm.cmpProps[propName] = newValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, propName);
                }
            }
            return set.call(vm.elm, newValue);
        }
    };
}

function getLinkedElement(cmp: Component): HTMLElement {
    return getComponentVM(cmp).elm;
}

interface ComposableEvent extends Event {
    composed: boolean;
}

interface ComponentHooks {
    callHook: VM["callHook"];
    setHook: VM["setHook"];
    getHook: VM["getHook"];
}

// This should be as performant as possible, while any initialization should be done lazily
function LightningElement(this: Component) {
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vmBeingConstructed);
        assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
    }
    const vm = vmBeingConstructed;
    const { elm, def, cmpRoot } = vm;
    const component = this;
    vm.component = component;
    // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        const { callHook, setHook, getHook } = arguments[0] as ComponentHooks;
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
    }
    // linking elm, shadow root and component with the VM
    setInternalField(component, ViewModelReflection, vm);
    setInternalField(elm, ViewModelReflection, vm);
    setInternalField(cmpRoot, ViewModelReflection, vm);
    // registered custom elements will be patched at the proto level already, not need to patch them here.
    if (isFalse(PatchedFlag in elm)) {
        if (elm.constructor.prototype !== BaseCustomElementProto) {
            // this is slow path for component instances using `is` attribute or `forceTagName`, which
            // are set to be removed in the near future.
            const { descriptors } = def;
            defineProperties(elm, descriptors);
        } else {
            const { elmProto } = def;
            setPrototypeOf(elm, elmProto);
        }
    }
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(elm);
        patchComponentWithRestrictions(component);
        patchShadowRootWithRestrictions(cmpRoot);
    }
}

LightningElement.prototype = {
    constructor: LightningElement,
    // HTML Element - The Good Parts
    dispatchEvent(event: ComposableEvent): boolean {
        const elm = getLinkedElement(this);
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
            if (arguments.length === 0) {
                throw new Error(`Failed to execute 'dispatchEvent' on ${this}: 1 argument required, but only 0 present.`);
            }
            if (!(event instanceof GlobalEvent)) {
                throw new Error(`Failed to execute 'dispatchEvent' on ${this}: parameter 1 is not of type 'Event'.`);
            }
            const { type: evtName, composed, bubbles } = event;
            assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);
            if (bubbles && ('composed' in event && !composed)) {
                assert.logWarning(`Invalid event "${evtName}" dispatched in element ${this}. Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.`);
            }
            if (vm.idx === 0) {
                assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
            }

            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        }
        return dispatchEvent.call(elm, event);
    },

    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
            assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
        }
        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.addEventListener(type, wrappedListener, options);
    },

    removeEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.removeEventListener(type, wrappedListener, options);
    },

    setAttributeNS(ns: string, attrName: string, value: any): void {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(getComponentVM(this)), `Failed to construct '${this}': The result must not have attributes.`);
            prepareForValidAttributeMutation(elm, attrName);
        }
        return elm.setAttributeNS.apply(elm, arguments);
    },

    removeAttributeNS(ns: string, attrName: string): void {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            prepareForValidAttributeMutation(elm, attrName);
        }
        return elm.removeAttributeNS.apply(elm, arguments);
    },

    removeAttribute(attrName: string) {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            prepareForValidAttributeMutation(elm, attrName);
        }
        elm.removeAttribute.apply(elm, arguments);
    },

    setAttribute(attrName: string, value: any): void {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(getComponentVM(this)), `Failed to construct '${this}': The result must not have attributes.`);
            prepareForValidAttributeMutation(elm, attrName);
        }
        return elm.setAttribute.apply(elm, arguments);
    },

    getAttribute(attrName: string): string | null {
        const elm = getLinkedElement(this);
        return elm.getAttribute.apply(elm, arguments);
    },

    getAttributeNS(ns: string, attrName: string) {
        const elm = getLinkedElement(this);
        return elm.getAttributeNS.apply(elm, arguments);
    },

    getBoundingClientRect(): ClientRect {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }
        return elm.getBoundingClientRect();
    },
    querySelector(selector: string): Element | null {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        const { elm } = vm;
        // fallback to a patched querySelector to respect
        // shadow semantics
        if (isTrue(vm.fallback)) {
            return lightDomQuerySelector(elm, selector);
        }
        // Delegate to custom element querySelector.
        return elm.querySelector(selector);
    },
    querySelectorAll(selector: string): Element[] {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        const { elm } = vm;
        // fallback to a patched querySelectorAll to respect
        // shadow semantics
        if (isTrue(vm.fallback)) {
            return lightDomQuerySelectorAll(elm, selector);
        }
        // Delegate to custom element querySelectorAll.
        return ArraySlice.call(elm.querySelectorAll(selector));
    },
    get tagName(): string {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get classList(): DOMTokenList {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(isBeingConstructed(vm), `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`);
        }
        return getLinkedElement(this).classList;
    },
    get template(): ShadowRoot {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        return vm.cmpRoot;
    },
    get root(): ShadowRoot {
        // TODO: issue #418
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
            assert.logWarning(`"this.root" access in ${vm.component} has been deprecated and will be removed. Use "this.template" instead.`);
        }
        return vm.cmpRoot;
    },
    get shadowRoot(): ShadowRoot | null {
        // from within, the shadowRoot is always in "closed" mode
        return null;
    },
    toString(): string {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        const { elm } = vm;
        const { tagName } = elm;
        const is = elm.getAttribute('is');
        return `<${tagName.toLowerCase()}${ is ? ' is="${is}' : '' }>`;
    },
};

/**
 * This abstract operation is supposed to be called once, with a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base Element should support. When creating the descriptors
 * for be Base Element, it also include the reactivity bit, so those standard properties are reactive.
 */
export function createBaseElementStandardPropertyDescriptors(StandardPropertyDescriptors: PropertyDescriptorMap): PropertyDescriptorMap {
    const descriptors = ArrayReduce.call(getOwnPropertyNames(StandardPropertyDescriptors), (seed: PropertyDescriptorMap, propName: string) => {
        seed[propName] = getHTMLPropDescriptor(propName, StandardPropertyDescriptors[propName]);
        return seed;
    }, create(null));
    return descriptors;
}

export { LightningElement };
