import assert from "./assert";
import {
    ArrayFilter,
    isObject,
    freeze,
    seal,
    defineProperty,
    defineProperties,
    getOwnPropertyNames,
    isUndefined,
    ArraySlice,
    isNull,
    forEach,
    ArrayReduce,
    isString,
    isFunction,
} from "./language";
import {
    getGlobalHTMLPropertiesInfo,
    getAttribute,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    setAttribute,
    setAttributeNS,
    GlobalHTMLPropDescriptors,
    attemptAriaAttributeFallback,
    CustomEvent,
    querySelectorAll as nativeQuerySelectorAll,
} from "./dom";

export function lightDOMQuerySelector(this: HTMLElement, selectors: string) {
    const ownerVM = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selectors);
    const nodeList = ArrayFilter.call(matches, (match) => wasNodePassedIntoVM(ownerVM, match));
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(ownerVM, nodeList[i])) {
            return nodeList[i];
        }
    }
    return null;
}

export function lightDOMQuerySelectorAll(this: HTMLElement, selectors: string) {
    const ownerVM = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selectors);
    return ArrayFilter.call(matches, (match) => wasNodePassedIntoVM(ownerVM, match));
}

import { vmBeingConstructed, isBeingConstructed, Component } from "./component";
import { Root, ShadowRoot, shadowRootQuerySelector, shadowRootQuerySelectorAll } from "./root";

import { getPropNameFromAttrName } from "./utils";
import { isRendering, vmBeingRendered } from "./invoker";
import { pierce, piercingHook } from "./piercing";
import { ViewModelReflection } from "./def";
import { Membrane } from "./membrane";

import { observeMutation, notifyMutation } from "./watcher";
import { isNodeOwnedByVM, wasNodePassedIntoVM, VM } from "./vm";

function getElementOwnerVM(elm: HTMLElement): VM | undefined {
    let parent = elm.parentElement;
    while (parent) {
        const ownerVM = getCustomElementVM(parent);
        if (isNodeOwnedByVM(ownerVM, elm)) {
            return ownerVM;
        }
        parent = elm.parentElement;
    }
    return undefined;
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

// This should be as performant as possible, while any initialization should be done lazily
class LWCElement implements Component {
    [ViewModelReflection]: VM;
    constructor() {
        if (isNull(vmBeingConstructed)) {
            throw new ReferenceError();
        }
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vmBeingConstructed);
            assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
        }
        const vm = vmBeingConstructed;
        const { elm, def } = vm;
        const component = this as Component;
        vm.component = component;
        // TODO: eventually the render method should be a static property on the ctor instead
        // catching render method to match other callbacks
        vm.render = component.render;
        // linking elm and its component with VM
        component[ViewModelReflection] = elm[ViewModelReflection] = vm;
        defineProperties(elm, def.descriptors);
    }
    // HTML Element - The Good Parts
    dispatchEvent(event: ComposableEvent): boolean {
        const elm = getLinkedElement(this);
        const vm = getCustomElementVM(this);

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
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        }

        // Pierce dispatchEvent so locker service has a chance to overwrite
        pierce(vm, elm);
        const dispatchEvent = piercingHook(vm.membrane as Membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    }

    addEventListener(type: string, listener: EventListener, options: any) {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            throw new Error(`Deprecated Method: usage of this.addEventListener("${type}", ...) in ${vm} is now deprecated. In most cases, you can use the declarative syntax in your template to listen for events coming from children. Additionally, for imperative code, you can do it via this.root.addEventListener().`);
        }
    }

    removeEventListener(type: string, listener: EventListener, options: any) {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            throw new Error(`Deprecated Method: usage of this.removeEventListener("${type}", ...) in ${vm} is now deprecated alongside this.addEventListener(). In most cases, you can use the declarative syntax in your template to listen for events coming from children. Additionally, for imperative code, you can do it via this.root.addEventListener() and this.root.removeEventListener().`);
        }
    }

    setAttributeNS(ns: string, attrName: string, value: any): void {
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // use cached setAttributeNS, because elm.setAttribute throws
        // when not called in template
        return setAttributeNS.call(getLinkedElement(this), ns, attrName, value);
    }

    removeAttributeNS(ns: string, attrName: string): void {
        // use cached removeAttributeNS, because elm.setAttribute throws
        // when not called in template
        return removeAttributeNS.call(getLinkedElement(this), ns, attrName);
    }

    removeAttribute(attrName: string) {
        const vm = getCustomElementVM(this);
        // use cached removeAttribute, because elm.setAttribute throws
        // when not called in template
        removeAttribute.call(vm.elm, attrName);
        attemptAriaAttributeFallback(vm, attrName);
    }

    setAttribute(attrName: string, value: any): void {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `Failed to construct '${this}': The result must not have attributes.`);
        }
        // marking the set is needed for the AOM polyfill
        vm.hostAttrs[attrName] = 1;
        // use cached setAttribute, because elm.setAttribute throws
        // when not called in template
        return setAttribute.call(getLinkedElement(this), attrName, value);
    }

    getAttributeNS(ns: string, attrName: string) {
        return getAttributeNS.call(getLinkedElement(this), ns, attrName);
    }

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
    }

    getBoundingClientRect(): ClientRect {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }
        return elm.getBoundingClientRect();
    }
    querySelector(selectors: string): Node | null {
        const elm = getLinkedElement(this);
        const match = elm.querySelector(selectors);
        if (process.env.NODE_ENV !== 'production') {
            if (shadowRootQuerySelector(this.template, selectors)) {
                assert.logWarning(`this.querySelector() can only return elements that were passed into ${this} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.`);
            }
        }

        return match;
    }
    querySelectorAll(selectors: string): NodeList {
        const elm = getLinkedElement(this);
        const matches = elm.querySelectorAll(selectors);

        if (process.env.NODE_ENV !== 'production') {
            if (matches.length === 0 && shadowRootQuerySelectorAll(this.template, selectors).length) {
                assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${this} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.`);
            }
        }

        return matches;
    }
    get tagName(): string {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    }
    get classList(): DOMTokenList {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(isBeingConstructed(vm), `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`);
        }
        return getLinkedElement(this).classList;
    }
    get template(): ShadowRoot {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    }
    get root(): ShadowRoot {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            assert.logWarning(`"this.root" access in ${vm.component} has been deprecated and will be removed. Use "this.template" instead.`);
        }
        return this.template;
    }
    toString(): string {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute.call(elm, 'is');
        return `<${tagName.toLowerCase()}${ is ? ' is="${is}' : '' }>`;
    }
}

defineProperties(LWCElement.prototype, htmlElementDescriptors);

// Global HTML Attributes
if (process.env.NODE_ENV !== 'production') {
    const info = getGlobalHTMLPropertiesInfo();
    forEach.call(getOwnPropertyNames(info), (propName: string) => {
        if (propName in LWCElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(LWCElement.prototype, propName, {
            get() {
                const vm = getCustomElementVM(this as HTMLElement);
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
            enumerable: false,
        });
    });

}

freeze(LWCElement);
seal(LWCElement.prototype);

export { LWCElement as Element };

export function getCustomElementVM(elmOrCmp: HTMLElement | Component | ShadowRoot): VM {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(elmOrCmp[ViewModelReflection]);
    }
    return elmOrCmp[ViewModelReflection] as VM;
}
