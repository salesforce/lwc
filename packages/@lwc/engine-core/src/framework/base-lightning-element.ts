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
    AccessibleElementProperties,
    assert,
    create,
    defineProperties,
    defineProperty,
    isFunction,
    isNull,
    isObject,
    KEY__SYNTHETIC_MODE,
    setPrototypeOf,
} from '@lwc/shared';
import {
    getChildren,
    getChildNodes,
    getFirstChild,
    getFirstElementChild,
    getLastChild,
    getLastElementChild,
    assertInstanceOfHTMLElement,
    attachShadow,
    addEventListener,
    removeEventListener,
    getAttribute,
    removeAttribute,
    setAttribute,
    getBoundingClientRect,
    isConnected,
    getClassList,
    dispatchEvent,
    getElementsByClassName,
    getElementsByTagName,
    querySelector,
    querySelectorAll,
} from '../renderer';
import { HTMLElementOriginalDescriptors } from './html-properties';
import { getWrappedComponentsListener } from './component';
import { vmBeingConstructed, isBeingConstructed, isInvokingRender } from './invoker';
import { associateVM, getAssociatedVM, RenderMode, ShadowMode, ShadowSupportMode, VM } from './vm';
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
import { HTMLElementConstructor } from './base-bridge-element';
import { lockerLivePropertyKey } from './membrane';

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
        get(this: LightningElement) {
            const vm = getAssociatedVM(this);
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    logError(
                        `The value of property \`${propName}\` can't be read from the constructor because the owner component hasn't set the value yet. Instead, use the constructor to set a default value for the property.`,
                        vm
                    );
                }
                return;
            }
            componentValueObserved(vm, propName);
            return get.call(vm.elm);
        },
        set(this: LightningElement, newValue: any) {
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

export interface LightningElementConstructor {
    new (): LightningElement;
    readonly prototype: LightningElement;
    readonly CustomElementConstructor: HTMLElementConstructor;

    delegatesFocus?: boolean;
    renderMode?: 'light' | 'shadow';
    shadowSupportMode?: ShadowSupportMode;
}

type HTMLElementTheGoodParts = Pick<Object, 'toString'> &
    Pick<
        HTMLElement,
        | 'accessKey'
        | 'addEventListener'
        | 'children'
        | 'childNodes'
        | 'classList'
        | 'dir'
        | 'dispatchEvent'
        | 'draggable'
        | 'firstChild'
        | 'firstElementChild'
        | 'getAttribute'
        | 'getAttributeNS'
        | 'getBoundingClientRect'
        | 'getElementsByClassName'
        | 'getElementsByTagName'
        | 'hasAttribute'
        | 'hasAttributeNS'
        | 'hidden'
        | 'id'
        | 'isConnected'
        | 'lang'
        | 'lastChild'
        | 'lastElementChild'
        | 'querySelector'
        | 'querySelectorAll'
        | 'removeAttribute'
        | 'removeAttributeNS'
        | 'removeEventListener'
        | 'setAttribute'
        | 'setAttributeNS'
        | 'spellcheck'
        | 'tabIndex'
        | 'title'
    >;

export interface LightningElement extends HTMLElementTheGoodParts, AccessibleElementProperties {
    template: ShadowRoot | null;
    render(): Template;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    renderedCallback?(): void;
    errorCallback?(error: any, stack: string): void;
}

/**
 * This class is the base class for any LWC element.
 * Some elements directly extends this class, others implement it via inheritance.
 **/
// @ts-ignore
export const LightningElement: LightningElementConstructor = function (
    this: LightningElement
): LightningElement {
    // This should be as performant as possible, while any initialization should be done lazily
    if (isNull(vmBeingConstructed)) {
        throw new ReferenceError('Illegal constructor');
    }

    const vm = vmBeingConstructed;
    const { def, elm } = vm;
    const { bridge } = def;

    if (process.env.NODE_ENV !== 'production') {
        assertInstanceOfHTMLElement(
            vm.elm,
            `Component creation requires a DOM element to be associated to ${vm}.`
        );
    }

    const component = this;
    setPrototypeOf(elm, bridge.prototype);

    vm.component = this;

    // Locker hooks assignment. When the LWC engine run with Locker, Locker intercepts all the new
    // component creation and passes hooks to instrument all the component interactions with the
    // engine. We are intentionally hiding this argument from the formal API of LightningElement
    // because we don't want folks to know about it just yet.
    if (arguments.length === 1) {
        const { callHook, setHook, getHook } = arguments[0];
        vm.callHook = callHook;
        vm.setHook = setHook;
        vm.getHook = getHook;
    }

    // Making the component instance a live value when using Locker to support expandos.
    (this as any)[lockerLivePropertyKey] = undefined;

    // Linking elm, shadow root and component with the VM.
    associateVM(component, vm);
    associateVM(elm, vm);

    if (vm.renderMode === RenderMode.Shadow) {
        doAttachShadow(vm);
    }

    // Adding extra guard rails in DEV mode.
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(elm);
        patchComponentWithRestrictions(component);
    }

    return this;
};

function doAttachShadow(vm: VM) {
    const {
        elm,
        mode,
        shadowMode,
        def: { ctor },
    } = vm;

    const cmpRoot = attachShadow(elm, {
        [KEY__SYNTHETIC_MODE]: shadowMode === ShadowMode.Synthetic,
        delegatesFocus: Boolean(ctor.delegatesFocus),
        mode,
    } as any);

    vm.cmpRoot = cmpRoot;
    associateVM(cmpRoot, vm);

    if (process.env.NODE_ENV !== 'production') {
        patchShadowRootWithRestrictions(cmpRoot);
    }
}

function warnIfInvokedDuringConstruction(vm: VM, methodOrPropName: string) {
    if (isBeingConstructed(vm)) {
        logError(
            `this.${methodOrPropName} should not be called during the construction of the custom element for ${getComponentTag(
                vm
            )} because the element is not yet in the DOM or has no children yet.`
        );
    }
}

// @ts-ignore
LightningElement.prototype = {
    constructor: LightningElement,

    dispatchEvent(event: Event): boolean {
        const { elm } = getAssociatedVM(this);
        return dispatchEvent(elm, event);
    },

    addEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

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
        addEventListener(elm, type, wrappedListener, options);
    },

    removeEventListener(
        type: string,
        listener: EventListener,
        options?: boolean | AddEventListenerOptions
    ): void {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

        const wrappedListener = getWrappedComponentsListener(vm, listener);
        removeEventListener(elm, type, wrappedListener, options);
    },

    hasAttribute(name: string): boolean {
        const { elm } = getAssociatedVM(this);
        return !isNull(getAttribute(elm, name));
    },

    hasAttributeNS(namespace: string | null, name: string): boolean {
        const { elm } = getAssociatedVM(this);
        return !isNull(getAttribute(elm, name, namespace));
    },

    removeAttribute(name: string): void {
        const { elm } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        removeAttribute(elm, name);
        lockAttribute(elm, name);
    },

    removeAttributeNS(namespace: string | null, name: string): void {
        const { elm } = getAssociatedVM(this);

        unlockAttribute(elm, name);
        removeAttribute(elm, name, namespace);
        lockAttribute(elm, name);
    },

    getAttribute(name: string): string | null {
        const { elm } = getAssociatedVM(this);
        return getAttribute(elm, name);
    },

    getAttributeNS(namespace: string | null, name: string): string | null {
        const { elm } = getAssociatedVM(this);
        return getAttribute(elm, name, namespace);
    },

    setAttribute(name: string, value: string): void {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        setAttribute(elm, name, value);
        lockAttribute(elm, name);
    },

    setAttributeNS(namespace: string | null, name: string, value: string): void {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct '${getComponentTag(vm)}': The result must not have attributes.`
            );
        }

        unlockAttribute(elm, name);
        setAttribute(elm, name, value, namespace);
        lockAttribute(elm, name);
    },

    getBoundingClientRect(): ClientRect {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

        if (process.env.NODE_ENV !== 'production') {
            warnIfInvokedDuringConstruction(vm, 'getBoundingClientRect()');
        }

        return getBoundingClientRect(elm);
    },

    get isConnected(): boolean {
        const { elm } = getAssociatedVM(this);
        return isConnected(elm);
    },

    get classList(): DOMTokenList {
        const vm = getAssociatedVM(this);
        const { elm } = vm;

        if (process.env.NODE_ENV !== 'production') {
            // TODO [#1290]: this still fails in dev but works in production, eventually, we should
            // just throw in all modes
            assert.isFalse(
                isBeingConstructed(vm),
                `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`
            );
        }

        return getClassList(elm);
    },

    get template(): ShadowRoot | null {
        const vm = getAssociatedVM(this);

        if (process.env.NODE_ENV !== 'production') {
            if (vm.renderMode === RenderMode.Light) {
                logError(
                    '`this.template` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.template.querySelector`, use `this.querySelector`.'
                );
            }
        }

        return vm.cmpRoot;
    },

    get shadowRoot(): null {
        // From within the component instance, the shadowRoot is always reported as "closed".
        // Authors should rely on this.template instead.
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

const queryAndChildGetterDescriptors: PropertyDescriptorMap = create(null);

// The reason we don't just call `import * as renderer from '../renderer'` here is that the bundle size
// is smaller if we reference each function individually. Otherwise Rollup will create one big frozen
// object representing the renderer, with a lot of methods we don't actually need.
const childGetters = <const>[
    'children',
    'childNodes',
    'firstChild',
    'firstElementChild',
    'lastChild',
    'lastElementChild',
];

function getChildGetter(methodName: typeof childGetters[number]) {
    switch (methodName) {
        case 'children':
            return getChildren;
        case 'childNodes':
            return getChildNodes;
        case 'firstChild':
            return getFirstChild;
        case 'firstElementChild':
            return getFirstElementChild;
        case 'lastChild':
            return getLastChild;
        case 'lastElementChild':
            return getLastElementChild;
    }
}

// Generic passthrough for child getters on HTMLElement to the relevant Renderer APIs
for (const childGetter of childGetters) {
    queryAndChildGetterDescriptors[childGetter] = {
        get(this: LightningElement) {
            const vm = getAssociatedVM(this);
            const { elm } = vm;

            if (process.env.NODE_ENV !== 'production') {
                // On the renderer itself, the name always starts with "get", e.g. "getChildren"
                const propName = `get${childGetter.charAt(0).toUpperCase()}${childGetter.substring(
                    1
                )}`;
                warnIfInvokedDuringConstruction(vm, propName);
            }

            return getChildGetter(childGetter)(elm);
        },
        configurable: true,
        enumerable: true,
    };
}

const queryMethods = <const>[
    'getElementsByClassName',
    'getElementsByTagName',
    'querySelector',
    'querySelectorAll',
];
function getQueryMethod(methodName: typeof queryMethods[number]) {
    switch (methodName) {
        case 'getElementsByClassName':
            return getElementsByClassName;
        case 'getElementsByTagName':
            return getElementsByTagName;
        case 'querySelector':
            return querySelector;
        case 'querySelectorAll':
            return querySelectorAll;
    }
}

// Generic passthrough for query APIs on HTMLElement to the relevant Renderer APIs
for (const queryMethod of queryMethods) {
    queryAndChildGetterDescriptors[queryMethod] = {
        value(this: LightningElement, arg: string) {
            const vm = getAssociatedVM(this);
            const { elm } = vm;

            if (process.env.NODE_ENV !== 'production') {
                warnIfInvokedDuringConstruction(vm, `${queryMethod}()`);
            }

            return getQueryMethod(queryMethod)(elm, arg);
        },
        configurable: true,
        enumerable: true,
        writable: true,
    };
}

defineProperties(LightningElement.prototype, queryAndChildGetterDescriptors);

export const lightningBasedDescriptors: PropertyDescriptorMap = create(null);
for (const propName in HTMLElementOriginalDescriptors) {
    lightningBasedDescriptors[propName] = createBridgeToElementDescriptor(
        propName,
        HTMLElementOriginalDescriptors[propName]
    );
}

defineProperties(LightningElement.prototype, lightningBasedDescriptors);

defineProperty(LightningElement, 'CustomElementConstructor', {
    get() {
        // If required, a runtime-specific implementation must be defined.
        throw new ReferenceError('The current runtime does not support CustomElementConstructor.');
    },
    configurable: true,
});

if (process.env.NODE_ENV !== 'production') {
    patchLightningElementPrototypeWithRestrictions(LightningElement.prototype);
}
