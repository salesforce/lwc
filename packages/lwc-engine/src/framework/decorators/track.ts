import assert from "../assert";
import { isArray, isObject, defineProperty, isUndefined } from "../language";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { VMElement, VM } from "../vm";
import { getCustomElementVM } from "../html-element";
import { membrane as reactiveMembrane } from './../reactive';

// stub function to prevent misuse of the @track decorator
export default function track() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail("@track may only be used as a decorator.");
    }
}

// TODO: how to allow symbols as property keys?
export function createTrackedPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor | undefined) {
    defineProperty(proto, key, {
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
            const reactiveValue = reactiveMembrane.getProxy(newValue);
            if (reactiveValue !== vm.cmpTrack[key]) {
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveValue !== newValue;
                    if (!isObservable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning(`Property "${key}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
                    }
                }
                vm.cmpTrack[key] = reactiveValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyMutation(this, key);
                }
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
        configurable: false,
    });
}
