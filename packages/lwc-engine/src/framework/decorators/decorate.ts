import assert from "../assert";
import { getOwnPropertyNames, isObject, isNull, getOwnPropertyDescriptor, defineProperty, isFunction } from "../language";

export type DecoratorFunction = (Ctor: any, key: PropertyKey, descriptor: PropertyDescriptor | undefined) => PropertyDescriptor;
export type DecoratorMap = Record<string, DecoratorFunction>;

export default function decorate(Ctor: any, decorators: DecoratorMap) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isFunction(Ctor), `decorate() expects the first argument to be a class.`);
        assert.isTrue(!isNull(decorators) && isObject(decorators), `decorate() expects the second argument to be an object with key value pairs.`);
    }
    const props = getOwnPropertyNames(decorators);
    for (let i = 0, len = props.length; i < len; i += 1) {
        const prop = props[i];
        const decorator = decorators[prop];
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(isFunction(decorator), `decorate() expects a decorator function for "${prop}".`);
        }
        const target = isFunction(Ctor) ? Ctor.prototype : Ctor;
        const originalDescriptor = getOwnPropertyDescriptor(target, prop);
        const descriptor = decorator(Ctor, prop, originalDescriptor);
        if (descriptor) {
            defineProperty(target, prop, descriptor);
        }
    }
}
