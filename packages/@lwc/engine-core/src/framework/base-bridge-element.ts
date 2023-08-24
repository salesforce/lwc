/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This module is responsible for creating the base bridge class BaseBridgeElement
 * that represents the HTMLElement extension used for any LWC inserted in the DOM.
 */
import {
    ArraySlice,
    create,
    defineProperties,
    defineProperty,
    freeze,
    getOwnPropertyNames,
    isUndefined,
    seal,
    keys,
    htmlPropertyToAttribute,
} from '@lwc/shared';
import { applyAriaReflection } from '@lwc/aria-reflection';
import { logError } from '../shared/logger';
import { getAssociatedVM } from './vm';
import { getReadOnlyProxy } from './membrane';
import { HTMLElementConstructor } from './html-element';
import { HTMLElementOriginalDescriptors } from './html-properties';

// A bridge descriptor is a descriptor whose job is just to get the component instance
// from the element instance, and get the value or set a new value on the component.
// This means that across different elements, similar names can get the exact same
// descriptor, so we can cache them:
const cachedGetterByKey: Record<string, (this: HTMLElement) => any> = create(null);
const cachedSetterByKey: Record<string, (this: HTMLElement, newValue: any) => any> = create(null);

function createGetter(key: string) {
    let fn = cachedGetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedGetterByKey[key] = function (this: HTMLElement): any {
            const vm = getAssociatedVM(this);
            const { getHook } = vm;
            return getHook(vm.component, key);
        };
    }
    return fn;
}

function createSetter(key: string) {
    let fn = cachedSetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedSetterByKey[key] = function (this: HTMLElement, newValue: any): any {
            const vm = getAssociatedVM(this);
            const { setHook } = vm;
            newValue = getReadOnlyProxy(newValue);
            setHook(vm.component, key, newValue);
        };
    }
    return fn;
}

function createMethodCaller(methodName: string): (...args: any[]) => any {
    return function (this: HTMLElement): any {
        const vm = getAssociatedVM(this);
        const { callHook, component } = vm;
        const fn = (component as any)[methodName];
        return callHook(vm.component, fn, ArraySlice.call(arguments));
    };
}

type AttributeChangedCallback = (
    this: HTMLElement,
    attrName: string,
    oldValue: string,
    newValue: string
) => void;

function createAttributeChangedCallback(
    attributeToPropMap: Record<string, string>,
    superAttributeChangedCallback?: AttributeChangedCallback
): AttributeChangedCallback {
    return function attributeChangedCallback(
        this: HTMLElement,
        attrName: string,
        oldValue: string,
        newValue: string
    ) {
        if (oldValue === newValue) {
            // Ignore same values.
            return;
        }
        const propName = attributeToPropMap[attrName];
        if (isUndefined(propName)) {
            if (!isUndefined(superAttributeChangedCallback)) {
                // delegate unknown attributes to the super.
                // Typescript does not like it when you treat the `arguments` object as an array
                // @ts-ignore type-mismatch
                superAttributeChangedCallback.apply(this, arguments);
            }
            return;
        }
        // Reflect attribute change to the corresponding property when changed from outside.
        (this as any)[propName] = newValue;
    };
}

export interface HTMLElementConstructor {
    prototype: HTMLElement;
    new (): HTMLElement;
}

export function HTMLBridgeElementFactory(
    SuperClass: HTMLElementConstructor,
    props: string[],
    methods: string[]
): HTMLElementConstructor {
    const HTMLBridgeElement = class extends SuperClass {};
    // generating the hash table for attributes to avoid duplicate fields and facilitate validation
    // and false positives in case of inheritance.
    const attributeToPropMap: Record<string, string> = create(null);
    const { attributeChangedCallback: superAttributeChangedCallback } = SuperClass.prototype as any;
    const { observedAttributes: superObservedAttributes = [] } = SuperClass as any;
    const descriptors: PropertyDescriptorMap = create(null);
    // expose getters and setters for each public props on the new Element Bridge
    for (let i = 0, len = props.length; i < len; i += 1) {
        const propName = props[i];
        attributeToPropMap[htmlPropertyToAttribute(propName)] = propName;
        descriptors[propName] = {
            get: createGetter(propName),
            set: createSetter(propName),
            enumerable: true,
            configurable: true,
        };
    }
    // expose public methods as props on the new Element Bridge
    for (let i = 0, len = methods.length; i < len; i += 1) {
        const methodName = methods[i];
        descriptors[methodName] = {
            value: createMethodCaller(methodName),
            writable: true,
            configurable: true,
        };
    }

    // creating a new attributeChangedCallback per bridge because they are bound to the corresponding
    // map of attributes to props. We do this after all other props and methods to avoid the possibility
    // of getting overrule by a class declaration in user-land, and we make it non-writable, non-configurable
    // to preserve this definition.
    descriptors.attributeChangedCallback = {
        value: createAttributeChangedCallback(attributeToPropMap, superAttributeChangedCallback),
    };

    // To avoid leaking private component details, accessing internals from outside a component is not allowed.
    descriptors.attachInternals = {
        get() {
            if (process.env.NODE_ENV !== 'production') {
                logError(
                    'attachInternals cannot be accessed outside of a component. Use this.attachInternals instead.'
                );
            }
        },
    };

    // Specify attributes for which we want to reflect changes back to their corresponding
    // properties via attributeChangedCallback.
    defineProperty(HTMLBridgeElement, 'observedAttributes', {
        get() {
            return [...superObservedAttributes, ...keys(attributeToPropMap)];
        },
    });
    defineProperties(HTMLBridgeElement.prototype, descriptors);
    return HTMLBridgeElement as HTMLElementConstructor;
}

export const BaseBridgeElement = HTMLBridgeElementFactory(
    HTMLElementConstructor,
    getOwnPropertyNames(HTMLElementOriginalDescriptors),
    []
);

if (process.env.IS_BROWSER) {
    // This ARIA reflection only really makes sense in the browser. On the server, there is no `renderedCallback()`,
    // so you cannot do e.g. `this.template.querySelector('x-child').ariaBusy = 'true'`. So we don't need to expose
    // ARIA props outside the LightningElement
    if (lwcRuntimeFlags.DISABLE_ARIA_REFLECTION_POLYFILL) {
        // If ARIA reflection is not applied globally to Element.prototype, apply it to HTMLBridgeElement.prototype.
        // This allows `elm.aria*` property accessors to work from outside a component, and to reflect `aria-*` attrs.
        // This is especially important because the template compiler compiles aria-* attrs on components to aria* props
        //
        // Also note that we apply this to BaseBridgeElement.prototype to avoid excessively redefining property
        // accessors inside the HTMLBridgeElementFactory.
        applyAriaReflection(BaseBridgeElement.prototype);
    }
}

freeze(BaseBridgeElement);
seal(BaseBridgeElement.prototype);
