import assert from "../assert";
import { defineProperty, isObject, isNull, isTrue } from "../language";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { EmptyObject } from "../utils";
import { isBeingConstructed, Component } from "../component";
import { VM, VMElement } from "../vm";
import { getCustomElementVM } from "../html-element";
import { isUndefined } from "../language";
import { membrane as reactiveMembrane } from "../reactive";

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
                    const isObservble = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservble && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = reactiveMembrane.getReadOnlyProxy(newValue);

                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, key);
                }
            } else if (process.env.NODE_ENV !== 'production') {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.logError(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    });
}

export function createPublicAccessorDescriptor(proto: object, key: string, descriptor: PropertyDescriptor) {
    const { get, set, enumerable } = descriptor;
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
                    const isObservble = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservble && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
                } else if (process.env.NODE_ENV !== 'production') {
                    assert.fail(`Invalid attempt to set a new value for property ${key} of ${vm} that does not has a setter decorated with @api.`);
                }
            } else if (process.env.NODE_ENV !== 'production') {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.fail(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            }
        },
        enumerable,
    });
}
