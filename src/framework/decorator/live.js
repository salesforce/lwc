import {
    markComponentAsDirty,
} from "./rendering.js";

export default function live() {
    return function decorator(target) {
        // this decorator is responsible for adding setters and getters for all properties on
        // target as a way for users to apply mutations to their components and get the instance
        // rerendered
        Object.getOwnPropertyNames(target).forEach((propName) => {
            let descriptor = Object.getOwnPropertyDescriptor(propName);
            if (!descriptor.get) {
                let value = target[propName];
                descriptor.get = () => value;
                descriptor.set = (newValue) => {
                    value = newValue;
                    if (value !== newValue) {
                        value = newValue;
                        markComponentAsDirty(target, propName);
                    }
                };
            }
        });
    }
}
