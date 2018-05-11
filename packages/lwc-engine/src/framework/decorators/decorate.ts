import { getOwnPropertyNames, getOwnPropertyDescriptor, defineProperty, isFunction, isUndefined } from "../language";

export type DecoratorFunction = (Ctor: any, key: PropertyKey, descriptor: PropertyDescriptor | undefined) => PropertyDescriptor;
export type DecoratorMap = Record<string, DecoratorFunction>;

export default function decorate(Ctor: any, decorators: DecoratorMap): any {
    // intentionally comparing decorators with null and undefined
    if (!isFunction(Ctor) || decorators == null) {
        throw new TypeError();
    }
    const props = getOwnPropertyNames(decorators);
    // intentionally allowing decoration of classes only for now
    const target = Ctor.prototype;
    for (let i = 0, len = props.length; i < len; i += 1) {
        const prop = props[i];
        const decorator = decorators[prop];
        if (!isFunction(decorator)) {
            throw new TypeError();
        }
        const originalDescriptor = getOwnPropertyDescriptor(target, prop);
        const descriptor = decorator(Ctor, prop, originalDescriptor);
        if (!isUndefined(descriptor)) {
            defineProperty(target, prop, descriptor);
        }
    }
    return Ctor; // chaining
}
