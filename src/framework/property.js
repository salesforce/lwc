// @flow

import { scheduleRehydration } from "./patcher.js";

export function initComponentProperties(vnode: Object) {
    const { data: { component, state } } = vnode;
    // this routine is responsible for adding setters and getters for all properties on
    // target as a way for users to apply mutations to their components and get the instance
    // rerendered
    Object.getOwnPropertyNames(component).forEach((propName: string) => {
        let { get, value, configurable, enumerable } = Object.getOwnPropertyDescriptor(component, propName);
        if (!get && configurable) {
            Object.defineProperty(component, propName, {
                get: (): any => value,
                set: (newValue: any) => {
                    if (value !== newValue) {
                        value = newValue;
                        state.isDirty = true;
                        scheduleRehydration(vnode);
                    }
                },
                configurable: false,
                enumerable,
            });
        }
    });
}
