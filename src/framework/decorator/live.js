// @flow

import {
    markComponentAsDirty,
} from "../rendering.js";

const flag = Symbol('Component decorated with @live');

export default function live(target: Object) {
    if (target[flag]) {
        return;
    }
    // this decorator is responsible for adding setters and getters for all properties on
    // target as a way for users to apply mutations to their components and get the instance
    // rerendered
    Object.getOwnPropertyNames(target).forEach((propName: string) => {
        let { get, value, configurable, enumerable } = Object.getOwnPropertyDescriptor(target, propName);
        if (!get && configurable) {
            Object.defineProperty(target, propName, {
                get: (): any => value,
                set: (newValue: any) => {
                    if (value !== newValue) {
                        value = newValue;
                        markComponentAsDirty(target, propName);
                    }
                },
                configurable: false,
                enumerable,
            });
        }
    });
    Object.defineProperty(target, flag, {
        value: true,
        enumerable: false,
        writable: false,
        configurable: false,
    });
}
