/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */
import {
    ArrayReduce,
    assert,
    create,
    defineProperties,
    fields,
    freeze,
    getOwnPropertyNames,
    isFalse,
    isFunction,
    isNull,
    isObject,
    seal,
} from '@lwc/shared';
import { logError } from '../shared/assert';
import { HTMLElementOriginalDescriptors } from './html-properties';
import { patchLightningElementPrototypeWithRestrictions } from './restrictions';
import {
    ComponentInterface,
    getWrappedComponentsListener,
    getComponentAsString,
    getTemplateReactiveObserver,
} from './component';
import { ViewModelReflection, EmptyObject } from './utils';
import { vmBeingConstructed, isBeingConstructed, isInvokingRender } from './invoker';
import { getComponentVM, VM } from './vm';
import { valueObserved, valueMutated } from '../libs/mutation-tracker';
import { dispatchEvent } from '../env/dom';
import { patchComponentWithRestrictions, patchShadowRootWithRestrictions } from './restrictions';
import { unlockAttribute, lockAttribute } from './attributes';
import { Template, isUpdatingTemplate, getVMBeingRendered } from './template';

const GlobalEvent = Event; // caching global reference to avoid poisoning

const { setHiddenField } = fields;

/**
 * This operation is called with a descriptor of an standard html property
 * that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base Lightning Element should support. When producing the new descriptors
 * for the Base Lightning Element, it also include the reactivity bit, so the standard property is reactive.
 */
function createBridgeToElementDescriptor(
    propName: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const { get, set, enumerable, configurable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard getter.`
            );
        }
        throw new TypeError();
    }
    if (!isFunction(set)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Detected invalid public property descriptor for HTMLElement.prototype.${propName} definition. Missing the standard setter.`
            );
        }
        throw new TypeError();
    }
    return {
        enumerable,
        configurable,
        get(this: ComponentInterface) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    logError(
                        `\`${name}\` constructor can't read the value of property \`${propName}\` because the owner component hasn't set the value yet. Instead, use the \`${name}\` constructor to set a default value for the property.`,
                        vm.elm
                    );
                }
                return;
            }
            valueObserved(this, propName);
            return get.call(vm.elm);
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                const vmBeingRendered = getVMBeingRendered();
                assert.invariant(
                    !isInvokingRender,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${propName}`
                );
                assert.invariant(
                    !isUpdatingTemplate,
                    `When updating the template of ${vmBeingRendered}, one of the accessors used by the template has side effects on the state of ${vm}.${propName}`
                );
                assert.isFalse(
                    isBeingConstructed(vm),
                    `Failed to construct '${getComponentAsString(
                        this
                    )}': The result must not have attributes.`
                );
                assert.invariant(
                    !isObject(newValue) || isNull(newValue),
                    `Invalid value "${newValue}" for "${propName}" of ${vm}. Value cannot be an object, must be a primitive value.`
                );
            }

            if (newValue !== vm.cmpProps[propName]) {
                vm.cmpProps[propName] = newValue;
                if (isFalse(vm.isDirty)) {
                    // perf optimization to skip this step if not in the DOM
                    valueMutated(this, propName);
                }
            }
            return set.call(vm.elm, newValue);
        },
    };
}

function getLinkedElement(cmp: ComponentInterface): HTMLElement {
    return getComponentVM(cmp).elm;
}

interface ComponentHooks {
    callHook: VM['callHook'];
    setHook: VM['setHook'];
    getHook: VM['getHook'];
}

export interface LightningElementConstructor {
    new (): LightningElement;
    readonly prototype: LightningElement;
}

export declare var LightningElement: LightningElementConstructor;

export interface LightningElement {
    // DOM - The good parts
    dispatchEvent(event: Event): boolean;
    addEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    setAttributeNS(ns: string | null, attrName: string, _value: string): void;
    removeAttributeNS(ns: string | null, attrName: string): void;
    removeAttribute(attrName: string): void;
    setAttribute(attrName: string, _value: string): void;
    getAttribute(attrName: string): string | null;
    getAttributeNS(ns: string, attrName: string): string | null;
    getBoundingClientRect(): ClientRect;
    querySelector<E extends Element = Element>(selectors: string): E | null;
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
    getElementsByTagName(tagNameOrWildCard: string): HTMLCollectionOf<Element>;
    getElementsByClassName(names: string): HTMLCollectionOf<Element>;
    classList: DOMTokenList;
    toString(): string;

    // LWC specifics
    template: ShadowRoot;
    render(): Template;

    // Callbacks
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    renderedCallback?(): void;
    errorCallback?(error: any, stack: string): void;

    // Default HTML Properties
    dir: string;
    id: string;
    accessKey: string;
    title: string;
    lang: string;
    hidden: boolean;
    draggable: boolean;
    tabIndex: number;

    // Aria Properties
    ariaAutoComplete: string | null;
    ariaChecked: string | null;
    ariaCurrent: string | null;
    ariaDisabled: string | null;
    ariaExpanded: string | null;
    ariaHasPopup: string | null;
    ariaHidden: string | null;
    ariaInvalid: string | null;
    ariaLabel: string | null;
    ariaLevel: string | null;
    ariaMultiLine: string | null;
    ariaMultiSelectable: string | null;
    ariaOrientation: string | null;
    ariaPressed: string | null;
    ariaReadOnly: string | null;
    ariaRequired: string | null;
    ariaSelected: string | null;
    ariaSort: string | null;
    ariaValueMax: string | null;
    ariaValueMin: string | null;
    ariaValueNow: string | null;
    ariaValueText: string | null;
    ariaLive: string | null;
    ariaRelevant: string | null;
    ariaAtomic: string | null;
    ariaBusy: string | null;
    ariaActiveDescendant: string | null;
    ariaControls: string | null;
    ariaDescribedBy: string | null;
    ariaFlowTo: string | null;
    ariaLabelledBy: string | null;
    ariaOwns: string | null;
    ariaPosInSet: string | null;
    ariaSetSize: string | null;
    ariaColCount: string | null;
    ariaColIndex: string | null;
    ariaDetails: string | null;
    ariaErrorMessage: string | null;
    ariaKeyShortcuts: string | null;
    ariaModal: string | null;
    ariaPlaceholder: string | null;
    ariaRoleDescription: string | null;
    ariaRowCount: string | null;
    ariaRowIndex: string | null;
    ariaRowSpan: string | null;
    ariaColSpan: string | null;
    role: string | null;
}

/**
 * This class is the base class for any LWC element.
 * Some elements directly extends this class, others implement it via inheritance.
 **/
function BaseLightningElementConstructor(this: LightningElement) {
    // This should be as performant as possible, while any initialization should be done lazily
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError();
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue('cmpProps' in vmBeingConstructed, `${vmBeingConstructed} is not a vm.`);
        assert.invariant(
            vmBeingConstructed.elm instanceof HTMLElement,
            `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`
        );
    }
    const vm = vmBeingConstructed;
    const {
        elm,
        mode,
        def: { ctor },
    } = vm;
    const component = this;
    vm.component = component;
    vm.tro = getTemplateReactiveObserver(vm as VM);
    vm.oar = create(null);
    // interaction hooks
    // We are intentionally hiding this argument from the formal API of LWCElement because
    // we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        const { callHook, setHook, getHook } = arguments[0] as ComponentHooks;
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
    }
    // attaching the shadowRoot
    const shadowRootOptions = {
        mode,
        delegatesFocus: !!ctor.delegatesFocus,
        '$$lwc-synthetic-mode$$': true,
    };
    const cmpRoot = elm.attachShadow(shadowRootOptions);
    // linking elm, shadow root and component with the VM
    setHiddenField(component, ViewModelReflection, vm);
    setHiddenField(cmpRoot, ViewModelReflection, vm);
    setHiddenField(elm, ViewModelReflection, vm);
    // VM is now initialized
    (vm as VM).cmpRoot = cmpRoot;
    if (process.env.NODE_ENV !== 'production') {
        patchComponentWithRestrictions(component);
        patchShadowRootWithRestrictions(cmpRoot, EmptyObject);
    }
    return this as LightningElement;
}

// HTML Element - The Good Parts
BaseLightningElementConstructor.prototype = {
    constructor: BaseLightningElementConstructor,
    dispatchEvent(event: Event): boolean {
        const elm = getLinkedElement(this);
        const vm = getComponentVM(this);

        if (process.env.NODE_ENV !== 'production') {
            if (arguments.length === 0) {
                throw new Error(
                    `Failed to execute 'dispatchEvent' on ${getComponentAsString(
                        this
                    )}: 1 argument required, but only 0 present.`
                );
            }
            if (!(event instanceof GlobalEvent)) {
                throw new Error(
                    `Failed to execute 'dispatchEvent' on ${getComponentAsString(
                        this
                    )}: parameter 1 is not of type 'Event'.`
                );
            }

            const { type: evtName } = event;
            assert.isFalse(
                isBeingConstructed(vm),
                `this.dispatchEvent() should not be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because no one is listening for the event "${evtName}" just yet.`
            );

            if (!/^[a-z][a-z0-9_]*$/.test(evtName)) {
                logError(
                    `Invalid event type "${evtName}" dispatched in element ${getComponentAsString(
                        this
                    )}. Event name must ${[
                        '1) Start with a lowercase letter',
                        '2) Contain only lowercase letters, numbers, and underscores',
                    ].join(' ')}`,
                    elm
                );
            }
        }
        return dispatchEvent.call(elm, event);
    },
    addEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            const vmBeingRendered = getVMBeingRendered();
            assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            assert.invariant(
                !isInvokingRender,
                `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`
            );
            assert.invariant(
                !isUpdatingTemplate,
                `Updating the template of ${vmBeingRendered} has side effects on the state of ${vm} by adding an event listener for "${type}".`
            );
            assert.invariant(
                isFunction(listener),
                `Invalid second argument for this.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`
            );
        }
        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.addEventListener(type, wrappedListener, options);
    },
    removeEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        }
        const wrappedListener = getWrappedComponentsListener(vm, listener);
        vm.elm.removeEventListener(type, wrappedListener, options);
    },
    setAttributeNS(ns: string | null, attrName: string, _value: string) {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(getComponentVM(this)),
                `Failed to construct '${getComponentAsString(
                    this
                )}': The result must not have attributes.`
            );
        }
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        elm.setAttributeNS.apply(elm, arguments);
        lockAttribute(elm, attrName);
    },
    removeAttributeNS(ns: string | null, attrName: string) {
        const elm = getLinkedElement(this);
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        elm.removeAttributeNS.apply(elm, arguments);
        lockAttribute(elm, attrName);
    },
    removeAttribute(attrName: string) {
        const elm = getLinkedElement(this);
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        elm.removeAttribute.apply(elm, arguments);
        lockAttribute(elm, attrName);
    },
    setAttribute(attrName: string, _value: string) {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(getComponentVM(this)),
                `Failed to construct '${getComponentAsString(
                    this
                )}': The result must not have attributes.`
            );
        }
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        elm.setAttribute.apply(elm, arguments);
        lockAttribute(elm, attrName);
    },
    getAttribute(attrName: string): string | null {
        const elm = getLinkedElement(this);
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        const value = elm.getAttribute.apply(elm, arguments);
        lockAttribute(elm, attrName);
        return value;
    },
    getAttributeNS(ns: string, attrName: string): string | null {
        const elm = getLinkedElement(this);
        unlockAttribute(elm, attrName);
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-ignore type-mismatch
        const value = elm.getAttributeNS.apply(elm, arguments);
        lockAttribute(elm, attrName);
        return value;
    },
    getBoundingClientRect(): ClientRect {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getBoundingClientRect() should not be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`
            );
        }
        return elm.getBoundingClientRect();
    },
    /**
     * Returns the first element that is a descendant of node that
     * matches selectors.
     */
    // querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    // querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelector() cannot be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because no children has been added to this element yet.`
            );
        }
        const { elm } = vm;
        return elm.querySelector(selectors);
    },

    /**
     * Returns all element descendants of node that
     * match selectors.
     */
    // querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>,
    // querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>,
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E> {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelectorAll() cannot be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because no children has been added to this element yet.`
            );
        }
        const { elm } = vm;
        return elm.querySelectorAll(selectors);
    },

    /**
     * Returns all element descendants of node that
     * match the provided tagName.
     */
    getElementsByTagName(tagNameOrWildCard: string): HTMLCollectionOf<Element> {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByTagName() cannot be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because no children has been added to this element yet.`
            );
        }
        const { elm } = vm;
        return elm.getElementsByTagName(tagNameOrWildCard);
    },

    /**
     * Returns all element descendants of node that
     * match the provide classnames.
     */
    getElementsByClassName(names: string): HTMLCollectionOf<Element> {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByClassName() cannot be called during the construction of the custom element for ${getComponentAsString(
                    this
                )} because no children has been added to this element yet.`
            );
        }
        const { elm } = vm;
        return elm.getElementsByClassName(names);
    },

    get classList(): DOMTokenList {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getComponentVM(this);
            // TODO: #1290 - this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`
            );
        }
        return getLinkedElement(this).classList;
    },
    get template(): ShadowRoot {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        }
        return vm.cmpRoot;
    },
    get shadowRoot(): ShadowRoot | null {
        // From within the component instance, the shadowRoot is always
        // reported as "closed". Authors should rely on this.template instead.
        return null;
    },
    render(): Template {
        const vm = getComponentVM(this);
        return vm.def.template;
    },
    toString(): string {
        const vm = getComponentVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        }
        return `[object ${vm.def.name}]`;
    },
};

// Typescript is inferring the wrong function type for this particular
// overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
// @ts-ignore type-mismatch
const baseDescriptors: PropertyDescriptorMap = ArrayReduce.call(
    getOwnPropertyNames(HTMLElementOriginalDescriptors),
    (descriptors: PropertyDescriptorMap, propName: string) => {
        descriptors[propName] = createBridgeToElementDescriptor(
            propName,
            HTMLElementOriginalDescriptors[propName]
        );
        return descriptors;
    },
    create(null)
);

defineProperties(BaseLightningElementConstructor.prototype, baseDescriptors);

if (process.env.NODE_ENV !== 'production') {
    patchLightningElementPrototypeWithRestrictions(BaseLightningElementConstructor.prototype);
}

freeze(BaseLightningElementConstructor);
seal(BaseLightningElementConstructor.prototype);

// @ts-ignore
export const BaseLightningElement: LightningElementConstructor = BaseLightningElementConstructor as unknown;
