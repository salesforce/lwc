import assert from "../assert";
import { isArray, isUndefined, create, getOwnPropertyDescriptor, defineProperty, isObject } from "../language";
import { getReactiveProxy, isObservable } from "../reactive";
import { isRendering, vmBeingRendered } from "../invoker";
import { subscribeToSetHook, notifyListeners } from "../watcher";
import { EmptyObject, getAttrNameFromPropName } from "../utils";
import { ViewModelReflection } from "../def";
import { isBeingConstructed } from "../component";

let vmBeingUpdated: VM | null = null;
export function prepareForPropUpdate(vm: VM) {
    assert.vm(vm);
    vmBeingUpdated = vm;
}

// TODO: how to allow symbols as property keys?
export function createPublicPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor) {
    defineProperty(proto, key, {
        get(): any {
            const vm: VM = this[ViewModelReflection];
            assert.vm(vm);
            if (isBeingConstructed(vm)) {
                assert.logError(`${vm} constructor should not read the value of property "${key}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
                return;
            }
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered, this, key);
            }
            return vm.cmpProps[key];
        },
        set(newValue: any) {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = newValue;

                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyListeners(this, key);
                }
            } else if (isBeingConstructed(vm)) {
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                assert.block(function devModeCheck () {
                    if (!observable && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                });
                vm.cmpProps[key] = newValue;
            } else {
                assert.logError(`${vm} can only set a new value for property "${key}" during construction.`);
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
    });
}

export function createPublicAccessorDescriptor(proto: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const { get, set, enumerable } = descriptor || EmptyObject;
    defineProperty(proto, key, {
        get(): any {
            const vm: VM = this[ViewModelReflection];
            assert.vm(vm);
            if (get) {
                return get.call(this);
            }
        },
        set(newValue: any) {
            const vm = this[ViewModelReflection];
            assert.vm(vm);
            if (!isBeingConstructed(vm) && vmBeingUpdated !== vm) {
                assert.logError(`${vm} can only set a new value for property "${key}" during construction.`);
                return;
            }
            vmBeingUpdated = null; // releasing the lock
            if (set) {
                set.call(this, newValue);
            } else {
                assert.fail(`Invalid attempt to set a new value for property ${key} of ${vm} that does not has a setter.`);
            }
        },
        enumerable,
    });
}
