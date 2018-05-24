import assert from "../assert";
import { defineProperty, isObject, isNull, isTrue, toString } from "../language";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { isBeingConstructed, Component } from "../component";
import { VM } from "../vm";
import { getCustomElementVM } from "../html-element";
import { isUndefined, isFunction } from "../language";
import { reactiveMembrane } from "../membrane";

// stub function to prevent misuse of the @api decorator
export default function api() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail("@api may only be used as a decorator.");
    }
}

let vmBeingUpdated: VM | null = null;
export function prepareForPropUpdate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    vmBeingUpdated = vm;
}

// TODO: how to allow symbols as property keys?
export function createPublicPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor | undefined) {
    defineProperty(proto, key, {
        get(this: Component): any {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.logError(`${vm} constructor should not read the value of property "${key}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
                }
                return;
            }
            observeMutation(this, key);
            return vm.cmpProps[key];
        },
        set(this: Component, newValue: any) {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (process.env.NODE_ENV !== 'production') {
                if (vmBeingUpdated !== vm) {
                    // logic for setting new properties of the element directly from the DOM
                    // is only recommended for root elements created via createElement()
                    assert.logWarning(`If property ${key} decorated with @api in ${vm} is used in the template, the value ${toString(newValue)} set manually may be overridden by the template, consider binding the property only in the template.`);
                }
            }
            vmBeingUpdated = null; // releasing the lock
            // not need to wrap or check the value since that is happening somewhere else
            vm.cmpProps[key] = reactiveMembrane.getReadOnlyProxy(newValue);

            // avoid notification of observability while constructing the instance
            if (vm.idx > 0) {
                // perf optimization to skip this step if not in the DOM
                notifyMutation(this, key);
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    });
}

export function createPublicAccessorDescriptor(proto: object, key: string, descriptor: PropertyDescriptor) {
    const { get, set, enumerable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Invalid attempt to create public property descriptor ${key} in ${proto}. It is missing the getter declaration with @api get ${key}() {} syntax.`);
        }
        throw new TypeError();
    }
    defineProperty(proto, key, {
        get(this: Component): any {
            if (process.env.NODE_ENV !== 'production') {
                const vm = getCustomElementVM(this);
                assert.vm(vm);
            }
            return get.call(this);
        },
        set(this: Component, newValue: any) {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (process.env.NODE_ENV !== 'production') {
                if (vmBeingUpdated !== vm) {
                    // logic for setting new properties of the element directly from the DOM
                    // is only recommended for root elements created via createElement()
                    assert.logWarning(`If property ${key} decorated with @api in ${vm} is used in the template, the value ${toString(newValue)} set manually may be overridden by the template, consider binding the property only in the template.`);
                }
            }
            vmBeingUpdated = null; // releasing the lock
            // not need to wrap or check the value since that is happening somewhere else
            if (set) {
                set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
            } else if (process.env.NODE_ENV !== 'production') {
                assert.fail(`Invalid attempt to set a new value for property ${key} of ${vm} that does not has a setter decorated with @api.`);
            }
        },
        enumerable,
    });
}
