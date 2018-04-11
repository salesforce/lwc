import assert from "../assert";
import { isArray, isObject, defineProperty, isUndefined } from "../language";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { VMElement } from "../vm";
import { getCustomElementVM } from "../html-element";
import { reactiveMembrane } from '../membrane';
import { createWireContext } from "../component";
import { WIRE_CONTEXT_ID, CONTEXT_UPDATED } from "../wiring";

// stub function to prevent misuse of the @track decorator
export default function track(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 1) {
            assert.fail("@track can be used as a decorator or as a function with one argument to produce a trackable version of the provided value.");
        }
    }
    return reactiveMembrane.getProxy(obj);
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

                const { def: { wire }, context } = vm;
                if (wire) {
                    createWireContext(vm);
                    context[WIRE_CONTEXT_ID][CONTEXT_UPDATED].values[key] = vm.cmpTrack[key];
                    context[WIRE_CONTEXT_ID][CONTEXT_UPDATED].mutated.add(key);
                }

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
