import assert from "../assert";
import { isRendering, vmBeingRendered, isBeingConstructed } from "../invoker";
import { isObject, isNull, isTrue, hasOwnProperty } from "../language";
import { observeMutation, notifyMutation } from "../watcher";
import { Component, ComponentConstructor } from "../component";
import { VM } from "../vm";
import { getCustomElementVM } from "../html-element";
import { isUndefined, isFunction } from "../language";
import { reactiveMembrane } from "../membrane";
import { hasPropertySetter, hasPropertyGetter } from "../utils";

export default function api(target: ComponentConstructor, propName: PropertyKey, descriptor: PropertyDescriptor | undefined): PropertyDescriptor {
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
            assert.fail(`@api decorator can only be used as a decorator function.`);
        }
    }
    const meta = target.publicProps;
    // publicProps must be an own property, otherwise the meta is inherited.
    const config = (!isUndefined(meta) && hasOwnProperty.call(target, 'publicProps') && hasOwnProperty.call(meta, propName)) ? meta[propName].config : 0;
    // initializing getters and setters for each public prop on the target prototype
    if (hasPropertySetter(config) || hasPropertyGetter(config)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), `Invalid property ${propName} definition in ${target}, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
            const mustHaveGetter = hasPropertyGetter(config);
            const mustHaveSetter = hasPropertySetter(config);
            if (mustHaveGetter) {
                assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${propName} decorated with @api in ${target}`);
            }
            if (mustHaveSetter) {
                assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${propName} decorated with @api in ${target}`);
                assert.isTrue(mustHaveGetter, `Missing getter for property ${propName} decorated with @api in ${target}. You cannot have a setter without the corresponding getter.`);
            }
        }
        // if it is configured as an accessor it must have a descriptor
        return createPublicAccessorDescriptor(target, propName, descriptor as PropertyDescriptor);
    } else {
        return createPublicPropertyDescriptor(target, propName, descriptor);
    }
}

let vmBeingUpdated: VM | null = null;
export function prepareForPropUpdate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    vmBeingUpdated = vm;
}

export function createPublicPropertyDescriptor(proto: ComponentConstructor, key: PropertyKey, descriptor: PropertyDescriptor | undefined): PropertyDescriptor {
    return {
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
    };
}

export function createPublicAccessorDescriptor(Ctor: ComponentConstructor, key: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
    const { get, set, enumerable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(`Invalid attempt to create public property descriptor ${key} in ${Ctor}. It is missing the getter declaration with @api get ${key}() {} syntax.`);
        }
        throw new TypeError();
    }
    return {
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
    };
}
