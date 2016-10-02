// @flow

import { scheduleRehydration } from "./patcher.js";
import assert from "./assert.js";

export function initComponentProperties(vm: Object) {
    assert.vm(vm);
    const { component } = vm;
    // this routine is responsible for adding setters and getters for all properties on
    // target as a way for users to apply mutations to their components and get the instance
    // rerendered
    Object.getOwnPropertyNames(component).forEach((propName: string) => {
        let { get, value, configurable, enumerable } = Object.getOwnPropertyDescriptor(component, propName);
        if (!get && configurable) {
            Object.defineProperty(component, propName, {
                get: (): any => {
                    if (vm.isRendering) {
                        vm.reactiveNames[propName] = true;
                    }
                    return value;
                },
                set: (newValue: any) => {
                    if (value !== newValue) {
                        assert.invariant(!vm.isRendering, `${vm}.render() method has side effects on the property ${propName}.`);
                        value = newValue;
                        if (vm.reactiveNames[propName]) {
                            vm.isDirty = true;
                        }
                        scheduleRehydration(vm);
                    }
                },
                configurable: false,
                enumerable,
            });
        }
    });
}
