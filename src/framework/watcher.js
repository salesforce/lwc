// @flow

import { scheduleRehydration } from "./vnode.js";

export function pinch(vnode: Object) {
    const { component } = vnode;
    // this routine is responsible for adding setters and getters for all properties on
    // target as a way for users to apply mutations to their components and get the instance
    // rerendered
    // TODO: attributes should throw if set is called
    Object.getOwnPropertyNames(component).forEach((propName: string) => {
        let { get, value, configurable, enumerable } = Object.getOwnPropertyDescriptor(component, propName);
        if (!get && configurable) {
            Object.defineProperty(component, propName, {
                get: (): any => value,
                set: (newValue: any) => {
                    if (value !== newValue) {
                        value = newValue;
                        scheduleRehydration(vnode);
                    }
                },
                configurable: false,
                enumerable,
            });
        }
    });
}

export function memoizerDescriptorFactory(): Object {
    var cache = new Map();
    return {
        value: (key: number, value: any): any => {
            if (cache.has(key)) {
                return cache.get(key);
            }
            cache.set(key, value);
            return value;
        },
        writable: false,
        enumerable: true,
    };
}
