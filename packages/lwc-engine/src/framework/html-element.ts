import assert from "./assert";
import { Component } from "./component";
import { toString, isObject, freeze, seal, defineProperty, defineProperties, getOwnPropertyNames, ArraySlice, isNull, forEach, isTrue } from "./language";
import { addCmpEventListener, removeCmpEventListener } from "./events";
import {
    getAttribute,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    setAttribute,
    setAttributeNS,
} from "./dom/element";
import {
    getGlobalHTMLPropertiesInfo,
    GlobalHTMLPropDescriptors,
    attemptAriaAttributeFallback,
} from "./dom/attributes";
import { ViewModelReflection, getPropNameFromAttrName } from "./utils";
import { vmBeingConstructed, isBeingConstructed, isRendering, vmBeingRendered } from "./invoker";
import { getComponentVM, VM, getCustomElementVM } from "./vm";
import { ArrayReduce, isString, isFunction } from "./language";
import { observeMutation, notifyMutation } from "./watcher";
import { CustomEvent, addEventListenerPatched, removeEventListenerPatched } from "./dom/event";
import { dispatchEvent } from "./dom/event-target";
import { lightDomQuerySelector, lightDomQuerySelectorAll } from "./dom/traverse";

function ElementShadowRootGetter(this: HTMLElement): ShadowRoot | null {
    const vm = getCustomElementVM(this);
    if (process.env.NODE_ENV === 'test') {
        return vm.cmpRoot;
    }
    // for now, shadowRoot is closed except for test mode
    return null;
}

const fallbackDescriptors = {
    shadowRoot: {
        get: ElementShadowRootGetter,
        configurable: true,
        enumerable: true,
    },
    querySelector: {
        value: lightDomQuerySelector,
        configurable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAll,
        configurable: true,
    },
    addEventListener: {
        value: addEventListenerPatched,
        configurable: true,
    },
    removeEventListener: {
        value: removeEventListenerPatched,
        configurable: true,
    },
};

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
            const vm: VM = this[ViewModelReflection];
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
            const vm = this[ViewModelReflection];
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

const htmlElementDescriptors = ArrayReduce.call(getOwnPropertyNames(GlobalHTMLPropDescriptors), (seed: PropertyDescriptorMap, propName: string) => {
    seed[propName] = getHTMLPropDescriptor(propName, GlobalHTMLPropDescriptors[propName]);
    return seed;
}, {});

function getLinkedElement(cmp: Component): HTMLElement {
    return cmp[ViewModelReflection].elm;
}

export interface ComposableEvent extends Event {
    composed: boolean;
}

interface ComponentHooks {
    callHook: VM["callHook"];
    setHook: VM["setHook"];
    getHook: VM["getHook"];
}

// This should be as performant as possible, while any initialization should be done lazily
function LWCElement(this: Component) {
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vmBeingConstructed);
        assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
    }
    const vm = vmBeingConstructed;
    const { elm, def, fallback } = vm;
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
    // linking elm and its component with VM
    component[ViewModelReflection] = elm[ViewModelReflection] = vm;
    defineProperties(elm, def.descriptors);
    if (isTrue(fallback)) {
        defineProperties(elm, fallbackDescriptors);
    }
}

LWCElement.prototype = {
    constructor: LWCElement,
    // HTML Element - The Good Parts
    dispatchEvent(event: ComposableEvent): boolean {
        const elm = getLinkedElement(this);
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
            if (arguments.length === 0) {
                throw new Error(`Failed to execute 'dispatchEvent' on ${this}: 1 argument required, but only 0 present.`);
            }
            if (!(event instanceof CustomEvent) && !(event instanceof Event)) {
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
                assert.logWarning(`Invalid event type "${evtName}" dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        }
        return dispatchEvent.call(elm, event);
    },

    addEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);

            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.addEventListener() on ${vm} does not support more than 2 arguments, instead received ${toString(options)}. Options to make the listener passive, once or capture are not allowed.`);
            }
        }
        addCmpEventListener(vm, type, listener);
    },

    removeEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);

            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.removeEventListener() on ${vm} does not support more than 2 arguments, instead received ${toString(options)}. Options to make the listener passive, once or capture are not allowed.`);
            }
        }
        removeCmpEventListener(vm, type, listener);
    },

    setAttributeNS(ns: string, attrName: string, value: any): void {
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // use cached setAttributeNS, because elm.setAttribute throws
        // when not called in template
        return setAttributeNS.call(getLinkedElement(this), ns, attrName, value);
    },

    removeAttributeNS(ns: string, attrName: string): void {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS.call(getLinkedElement(this), ns, attrName);
    },

    removeAttribute(attrName: string) {
        const vm = getComponentVM(this);
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        removeAttribute.call(vm.elm, attrName);
        attemptAriaAttributeFallback(vm, attrName);
    },

    setAttribute(attrName: string, value: any): void {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // marking the set is needed for the AOM polyfill
        vm.hostAttrs[attrName] = 1;
        // use cached setAttribute, because elm.setAttribute throws
        // when not called in template
        return setAttribute.call(getLinkedElement(this), attrName, value);
    },

    getAttributeNS(ns: string, attrName: string) {
        return getAttributeNS.call(getLinkedElement(this), ns, attrName);
    },

    getAttribute(attrName: string): string | null {
        // logging errors for experimental and special attributes
        if (process.env.NODE_ENV !== 'production') {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (isString(attrName)) {
                const propName = getPropNameFromAttrName(attrName);
                const info = getGlobalHTMLPropertiesInfo();
                if (info[propName] && info[propName].attribute) {
                    const { error, experimental } = info[propName];
                    if (error) {
                        assert.logError(error);
                    } else if (experimental) {
                        assert.logError(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                    }
                }
            }
        }

        return getAttribute.apply(getLinkedElement(this), ArraySlice.call(arguments));
    },

    getBoundingClientRect(): ClientRect {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }
        return elm.getBoundingClientRect();
    },
    querySelector(selector: string): Node | null {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        // Delegate to custom element querySelector.
        // querySelector on the custom element will respect
        // shadow semantics
        return vm.elm.querySelector(selector);
    },
    querySelectorAll(selector: string): NodeList {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        // Delegate to custom element querySelectorAll.
        // querySelectorAll on the custom element will respect
        // shadow semantics
        return vm.elm.querySelectorAll(selector);
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
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
            assert.logWarning(`"this.root" access in ${vm.component} has been deprecated and will be removed. Use "this.template" instead.`);
        }
        return vm.cmpRoot;
    },
    toString(): string {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute.call(elm, 'is');
        return `<${tagName.toLowerCase()}${ is ? ' is="${is}' : '' }>`;
    },
};

defineProperties(LWCElement.prototype, htmlElementDescriptors);

// Global HTML Attributes
if (process.env.NODE_ENV !== 'production') {
    const info = getGlobalHTMLPropertiesInfo();
    forEach.call(getOwnPropertyNames(info), (propName: string) => {
        if (propName in LWCElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(LWCElement.prototype, propName, {
            get(this: Component) {
                const vm = getComponentVM(this);
                const { error, attribute, readOnly, experimental } = info[propName];
                const msg: any[] = [];
                msg.push(`Accessing the global HTML property "${propName}" in ${vm} is disabled.`);
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push(`This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push(`Property is read-only.`);
                    }
                    if (attribute) {
                        msg.push(`"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                        msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                        msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                    }
                }
                console.log(msg.join('\n')); // tslint:disable-line
                return; // explicit undefined
            },
            // a setter is required here to avoid TypeError's when an attribute is set in a template but only the above getter is defined
            set() {}, // tslint:disable-line
            enumerable: false,
        });
    });
}

freeze(LWCElement);
seal(LWCElement.prototype);

export { LWCElement as Element };
