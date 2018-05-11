import assert from "../assert";
import { isArray, isObject, isUndefined } from "../language";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { VMElement } from "../vm";
import { getCustomElementVM } from "../html-element";
import { reactiveMembrane } from '../membrane';

export default function track(target: any, prop: PropertyKey, descriptor: PropertyDescriptor | undefined): PropertyDescriptor | any {
    if (arguments.length === 1) {
        return reactiveMembrane.getProxy(target);
    }
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
            assert.fail(`@track decorator can only be used with one argument to return a trackable object, or as a decorator function.`);
        }
        if (!isUndefined(descriptor)) {
            const { get, set, configurable, writable } = descriptor;
            assert.isTrue(!get && !set, `Compiler Error: A @track decorator can only be applied to a public field.`);
            assert.isTrue(configurable !== false, `Compiler Error: A @track decorator can only be applied to a configurable property.`);
            assert.isTrue(writable !== false, `Compiler Error: A @track decorator can only be applied to a writable property.`);
        }
    }
    return createTrackedPropertyDescriptor(target, prop, isObject(descriptor) ? descriptor.enumerable === true : true);
}

export function createTrackedPropertyDescriptor(Ctor: any, key: PropertyKey, enumerable: boolean): PropertyDescriptor {
    return {
        get(this: VMElement): any {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            observeMutation(this, key);
            return vm.cmpTrack[key];
        },
        set(this: VMElement, newValue: any) {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            const reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);
            if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveOrAnyValue !== newValue;
                    if (!isObservable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning(`Property "${key}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
                    }
                }
                vm.cmpTrack[key] = reactiveOrAnyValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, key);
                }
            }
        },
        enumerable,
        configurable: true,
    };
}
