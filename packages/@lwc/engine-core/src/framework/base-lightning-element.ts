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
    assert,
    create,
    defineProperties,
    freeze,
    isFunction,
    isNull,
    seal,
    defineProperty,
    isUndefined,
    isObject,
} from '@lwc/shared';
import { HTMLElementOriginalDescriptors } from './html-element';
import {
    ComponentInterface,
    getWrappedComponentsListener,
    getTemplateReactiveObserver,
    ComponentConstructor,
} from './component';
import { vmBeingConstructed, isBeingConstructed, isInvokingRender } from './invoker';
import { associateVM, getAssociatedVM, VM } from './vm';
import { componentValueMutated, componentValueObserved } from './mutation-tracker';
import {
    patchComponentWithRestrictions,
    patchShadowRootWithRestrictions,
    patchLightningElementPrototypeWithRestrictions,
    patchCustomElementWithRestrictions,
} from './restrictions';
import { unlockAttribute, lockAttribute } from './attributes';
import { Template, isUpdatingTemplate, getVMBeingRendered } from './template';
import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';
import { buildCustomElementConstructor } from './wc';
import { HTMLElementConstructor } from './base-bridge-element';

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
            const vm = getAssociatedVM(this);
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    logError(
                        `\`${name}\` constructor can't read the value of property \`${propName}\` because the owner component hasn't set the value yet. Instead, use the \`${name}\` constructor to set a default value for the property.`,
                        vm
                    );
                }
                return;
            }
            componentValueObserved(vm, propName);
            return get.call(vm.elm);
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
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
                    `Failed to construct '${getComponentTag(
                        vm
                    )}': The result must not have attributes.`
                );
                assert.invariant(
                    !isObject(newValue) || isNull(newValue),
                    `Invalid value "${newValue}" for "${propName}" of ${vm}. Value cannot be an object, must be a primitive value.`
                );
            }

            if (newValue !== vm.cmpProps[propName]) {
                vm.cmpProps[propName] = newValue;

                componentValueMutated(vm, propName);
            }
            return set.call(vm.elm, newValue);
        },
    };
}

interface ComponentHooks {
    callHook: VM['callHook'];
    setHook: VM['setHook'];
    getHook: VM['getHook'];
}

export interface LightningElementConstructor {
    new (): LightningElement;
    readonly prototype: LightningElement;
    readonly CustomElementConstructor: HTMLElementConstructor;
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
    isConnected: boolean;
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
    spellcheck: boolean;
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
        throw new ReferenceError('Illegal constructor');
    }

    const vm = vmBeingConstructed as VM;
    const {
        elm,
        mode,
        def: { ctor },
        renderer,
    } = vm;
    const component = this;
    vm.component = component;
    vm.tro = getTemplateReactiveObserver(vm);
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
    const cmpRoot = renderer.attachShadow(elm, {
        mode,
        delegatesFocus: !!ctor.delegatesFocus,
        '$$lwc-synthetic-mode$$': true,
    });
    // linking elm, shadow root and component with the VM
    associateVM(component, vm);
    associateVM(cmpRoot, vm);
    associateVM(elm, vm);
    // VM is now initialized
    vm.cmpRoot = cmpRoot;
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(elm);
        patchComponentWithRestrictions(component);
        patchShadowRootWithRestrictions(cmpRoot);
    }
    return this as LightningElement;
}

// HTML Element - The Good Parts
BaseLightningElementConstructor.prototype = {
    constructor: BaseLightningElementConstructor,

    dispatchEvent(event: Event): boolean {
        const { elm, renderer } = getAssociatedVM(this);
        return renderer.dispatchEvent(elm, event);
    },

    addEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            const vmBeingRendered = getVMBeingRendered();
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
        renderer.addEventListener(elm, type, wrappedListener, options);
    },

    removeEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ) {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        renderer.removeEventListener(elm, type, wrappedListener, options);
    },

    getAttribute(name: string): string | null {
        const { elm, renderer } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        const value = renderer.getAttribute(elm, name);
        lockAttribute(elm, name);

        return value;
    },

    getAttributeNS(namespace: string, name: string): string | null {
        const { elm, renderer } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        const value = renderer.getAttribute(elm, name, namespace);
        lockAttribute(elm, name);

        return value;
    },

    setAttribute(name: string, value: string) {
        const { elm, renderer } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        renderer.setAttribute(elm, name, value);
        lockAttribute(elm, name);
    },

    setAttributeNS(namespace: string | null, name: string, value: string) {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        renderer.setAttribute(elm, name, value, namespace);
        lockAttribute(elm, name);
    },

    removeAttribute(name: string) {
        const { elm, renderer } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        renderer.removeAttribute(elm, name);
        lockAttribute(elm, name);
    },

    removeAttributeNS(namespace: string | null, name: string) {
        const { elm, renderer } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        renderer.removeAttribute(elm, name, namespace);
        lockAttribute(elm, name);
    },

    getBoundingClientRect(): ClientRect {
        const { elm, renderer } = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const vm = getAssociatedVM(this);
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getBoundingClientRect() should not be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`
            );
        }

        return renderer.getBoundingClientRect(elm);
    },

    querySelector<E extends Element = Element>(selectors: string): E | null {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelector() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return renderer.querySelector(elm, selectors);
    },

    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E> {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.querySelectorAll() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        // TODO [#0]: Fix this typing issue.
        return renderer.querySelectorAll(elm, selectors) as any;
    },

    getElementsByTagName(tagNameOrWildCard: string): HTMLCollectionOf<Element> {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByTagName() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return renderer.getElementsByTagName(elm, tagNameOrWildCard);
    },

    getElementsByClassName(names: string): HTMLCollectionOf<Element> {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `this.getElementsByClassName() cannot be called during the construction of the custom element for ${getComponentTag(
                    vm
                )} because no children has been added to this element yet.`
            );
        }

        return renderer.getElementsByClassName(elm, names);
    },

    get isConnected(): boolean {
        const { elm, renderer } = getAssociatedVM(this);
        return renderer.isConnected(elm);
    },

    get classList(): DOMTokenList {
        const vm = getAssociatedVM(this);
        const { elm, renderer } = vm;

        if (process.env.NODE_ENV !== 'production') {
            // TODO [#1290]: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`
            );
        }

        return renderer.getClassList(elm);
    },

    get template(): ShadowRoot {
        const vm = getAssociatedVM(this);
        return vm.cmpRoot;
    },

    get shadowRoot(): ShadowRoot | null {
        // From within the component instance, the shadowRoot is always
        // reported as "closed". Authors should rely on this.template instead.
        return null;
    },

    render(): Template {
        const vm = getAssociatedVM(this);
        return vm.def.template;
    },

    toString(): string {
        const vm = getAssociatedVM(this);
        return `[object ${vm.def.name}]`;
    },
};

export const lightningBasedDescriptors: PropertyDescriptorMap = create(null);
for (const propName in HTMLElementOriginalDescriptors) {
    lightningBasedDescriptors[propName] = createBridgeToElementDescriptor(
        propName,
        HTMLElementOriginalDescriptors[propName]
    );
}

defineProperties(BaseLightningElementConstructor.prototype, lightningBasedDescriptors);

const ComponentConstructorAsCustomElementConstructorMap = new Map<
    ComponentConstructor,
    HTMLElementConstructor
>();

function getCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    if (Ctor === BaseLightningElement) {
        throw new TypeError(
            `Invalid Constructor. LightningElement base class can't be claimed as a custom element.`
        );
    }
    let ce = ComponentConstructorAsCustomElementConstructorMap.get(Ctor);
    if (isUndefined(ce)) {
        ce = buildCustomElementConstructor(Ctor);
        ComponentConstructorAsCustomElementConstructorMap.set(Ctor, ce);
    }
    return ce;
}

/**
 * This static getter builds a Web Component class from a LWC constructor
 * so it can be registered as a new element via customElements.define()
 * at any given time. E.g.:
 *
 *      import Foo from 'ns/foo';
 *      customElements.define('x-foo', Foo.CustomElementConstructor);
 *      const elm = document.createElement('x-foo');
 *
 */
defineProperty(BaseLightningElementConstructor, 'CustomElementConstructor', {
    get() {
        return getCustomElementConstructor(this);
    },
});

if (process.env.NODE_ENV !== 'production') {
    patchLightningElementPrototypeWithRestrictions(BaseLightningElementConstructor.prototype);
}

freeze(BaseLightningElementConstructor);
seal(BaseLightningElementConstructor.prototype);

// @ts-ignore
export const BaseLightningElement: LightningElementConstructor = BaseLightningElementConstructor as unknown;
