import assert from "../assert";
import { isArray, isUndefined, create, getOwnPropertyDescriptor, defineProperty, isObject, isNull } from "../language";
import { getReactiveProxy, isObservable } from "../reactive";
import { isRendering, vmBeingRendered } from "../invoker";
import { subscribeToSetHook, notifyListeners } from "../watcher";
import { EmptyObject } from "../utils";
import { ViewModelReflection } from "../def";
import { isBeingConstructed } from "../component";

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
export function createPublicPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor) {
    defineProperty(proto, key, {
        get(): any {
            const vm: VM = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.logError(`${vm} constructor should not read the value of property "${key}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
                }
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
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (vm.vnode.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                if (process.env.NODE_ENV !== 'production') {
                    if (!observable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                vm.cmpProps[key] = newValue;

                // avoid notification of observability while constructing the instance
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyListeners(this, key);
                }
            } else if (process.env.NODE_ENV !== 'production') {
                // logic for setting new properties of the element directly from the DOM
                // will only be allowed for root elements created via createElement()
                assert.logError(`Invalid attempt to set property ${key} from ${vm} to ${newValue}. This property was decorated with @api, and can only be changed via the template.`);
            }
        },
        enumerable: descriptor ? descriptor.enumerable : true,
    });
}

export function createPublicAccessorDescriptor(proto: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const { get, set, enumerable } = descriptor || EmptyObject;
    defineProperty(proto, key, {
        get(): any {
            if (process.env.NODE_ENV !== 'production') {
                const vm: VM = this[ViewModelReflection];
                assert.vm(vm);
            }
            if (get) {
                return get.call(this);
            }
        },
        set(newValue: any) {
            const vm = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            if (vm.vnode.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                const observable = isObservable(newValue);
                newValue = observable ? getReactiveProxy(newValue) : newValue;
                if (process.env.NODE_ENV !== 'production') {
                    if (!observable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(`Assigning a non-reactive value ${newValue} to member property ${key} of ${vm} is not common because mutations on that value cannot be observed.`);
                    }
                }
            }
            if (vmBeingUpdated === vm) {
                // not need to wrap or check the value since that is happening somewhere else
                vmBeingUpdated = null; // releasing the lock
                if (set) {
                    set.call(this, newValue);
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
