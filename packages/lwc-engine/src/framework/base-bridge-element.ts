/**
 * This module is responsible for creating the base bridge class BaseBridgeElement
 * that represents the HTMLElement extension used for any LWC inserted in the DOM.
 */
import {
    freeze,
    create,
    getOwnPropertyNames,
    isUndefined,
    defineProperties,
    seal,
    ArraySlice,
} from "../shared/language";
import { getCustomElementVM } from "./vm";
import {
    ComponentInterface
 } from './component';
import { HTMLElementOriginalDescriptors } from "./html-properties";

// A bridge descriptor is a descriptor whose job is just to get the component instance
// from the element instance, and get the value or set a new value on the component.
// This means that across different elements, similar names can get the exact same
// descriptor, so we can cache them:
const cachedGetterByKey: Record<string, (this: HTMLElement) => any> = create(null);
const cachedSetterByKey: Record<string, (this: HTMLElement, newValue: any) => any> = create(null);

function createGetter(key: string) {
    let fn = cachedGetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedGetterByKey[key] = function(this: HTMLElement): any {
            const vm = getCustomElementVM(this);
            const { getHook } = vm;
            return getHook(vm.component as ComponentInterface, key);
        };
    }
    return fn;
}

function createSetter(key: string) {
    let fn = cachedSetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedSetterByKey[key] = function(this: HTMLElement, newValue: any): any {
            const vm = getCustomElementVM(this);
            const { setHook } = vm;
            setHook(vm.component as ComponentInterface, key, newValue);
        };
    }
    return fn;
}

function createMethodCaller(methodName: string): (...args: any[]) => any {
    return function(this: HTMLElement): any {
        const vm = getCustomElementVM(this);
        const { callHook, component } = vm;
        const fn = (component as ComponentInterface)[methodName];
        return callHook(vm.component as ComponentInterface, fn, ArraySlice.call(arguments));
    };
}

export type HTMLElementConstructor = new () => HTMLElement;

export function HTMLBridgeElementFactory(SuperClass: HTMLElementConstructor, props: string[], methods: string[]): HTMLElementConstructor {
    class HTMLBridgeElement extends SuperClass {}
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
    return HTMLBridgeElement;
}

export const BaseBridgeElement = HTMLBridgeElementFactory(HTMLElement, getOwnPropertyNames(HTMLElementOriginalDescriptors), []);

freeze(BaseBridgeElement);
seal(BaseBridgeElement.prototype);
