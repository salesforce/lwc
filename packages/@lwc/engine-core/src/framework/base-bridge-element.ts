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

import { getAssociatedVM } from './vm';
import { reactiveMembrane } from './membrane';
import { HTMLElementConstructor } from './html-element';
import { HTMLElementOriginalDescriptors } from './html-properties';
import { isAttributeLocked } from './attributes';

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
            newValue = reactiveMembrane.getReadOnlyProxy(newValue);
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
        if (!isAttributeLocked(this, attrName)) {
            // Ignore changes triggered by the engine itself during:
            // * diffing when public props are attempting to reflect to the DOM
            // * component via `this.setAttribute()`, should never update the prop
            // Both cases, the setAttribute call is always wrapped by the unlocking of the
            // attribute to be changed
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

freeze(BaseBridgeElement);
seal(BaseBridgeElement.prototype);
