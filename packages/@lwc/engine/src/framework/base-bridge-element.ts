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
    isFunction,
    isUndefined,
    seal,
    setPrototypeOf,
} from '@lwc/shared';
import { getAssociatedVM } from './vm';
import { HTMLElementOriginalDescriptors } from './html-properties';
import { reactiveMembrane } from './membrane';

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

export interface HTMLElementConstructor {
    prototype: HTMLElement;
    new (): HTMLElement;
}

export function HTMLBridgeElementFactory(
    SuperClass: HTMLElementConstructor,
    props: string[],
    methods: string[]
): HTMLElementConstructor {
    let HTMLBridgeElement;
    /**
     * Modern browsers will have all Native Constructors as regular Classes
     * and must be instantiated with the new keyword. In older browsers,
     * specifically IE11, those are objects with a prototype property defined,
     * since they are not supposed to be extended or instantiated with the
     * new keyword. This forking logic supports both cases, specifically because
     * wc.ts relies on the construction path of the bridges to create new
     * fully qualifying web components.
     */
    if (isFunction(SuperClass)) {
        HTMLBridgeElement = class extends SuperClass {};
    } else {
        HTMLBridgeElement = function () {
            // Bridge classes are not supposed to be instantiated directly in
            // browsers that do not support web components.
            throw new TypeError('Illegal constructor');
        };
        // prototype inheritance dance
        setPrototypeOf(HTMLBridgeElement, SuperClass);
        setPrototypeOf(HTMLBridgeElement.prototype, SuperClass!.prototype);
        defineProperty(HTMLBridgeElement.prototype, 'constructor', {
            writable: true,
            configurable: true,
            value: HTMLBridgeElement,
        });
    }
    const descriptors: PropertyDescriptorMap = create(null);
    // expose getters and setters for each public props on the new Element Bridge
    for (let i = 0, len = props.length; i < len; i += 1) {
        const propName = props[i];
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
    defineProperties(HTMLBridgeElement.prototype, descriptors);
    return HTMLBridgeElement as HTMLElementConstructor;
}

export const BaseBridgeElement = HTMLBridgeElementFactory(
    HTMLElement,
    getOwnPropertyNames(HTMLElementOriginalDescriptors),
    []
);

freeze(BaseBridgeElement);
seal(BaseBridgeElement.prototype);
