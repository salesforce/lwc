import assert from "../assert";
import { isArray, isObject, defineProperty, isUndefined } from "../language";
import { getReactiveProxy, isObservable } from "../reactive";
import { isRendering, vmBeingRendered } from "../invoker";
import { subscribeToSetHook, notifyListeners } from "../watcher";
import { VMElement, VM } from "../vm";
import { getCustomElementVM } from "../html-element";

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
            if (isRendering) {
                // this is needed because the proxy used by template is not sufficient
                // for public props accessed from within a getter in the component.
                subscribeToSetHook(vmBeingRendered as VM, this, key);
            }
            return vm.cmpTrack[key];
        },
        set(this: VMElement, newValue: any) {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }

            const observable = isObservable(newValue);
            newValue = observable ? getReactiveProxy(newValue) : newValue;

            if (newValue !== vm.cmpTrack[key]) {

                if (process.env.NODE_ENV !== 'production') {
                    if (!observable && newValue !== null && (isObject(newValue) || isArray(newValue))) {
                        assert.logWarning(`Property "${key}" of ${vm} is set to a non-trackable object, which means changes into that object cannot be observed.`);
                    }
                }
                vm.cmpTrack[key] = newValue;
                if (vm.idx > 0) {
                    // perf optimization to skip this step if not in the DOM
                    notifyListeners(this, key);
                }
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
        configurable: false,
    });
}
