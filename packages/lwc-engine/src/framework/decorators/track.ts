import assert from "../assert";
import { isArray, isObject, defineProperty, isUndefined } from "../language";
import { getReactiveProxy, isObservable } from "../reactive";
import { isRendering, vmBeingRendered } from "../invoker";
import { observeMutation, notifyMutation } from "../watcher";
import { VMElement, VM } from "../vm";
import { getCustomElementVM } from "../html-element";
import { ReactiveMembrane } from 'locker-membrane';

const membrane = new ReactiveMembrane({
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});

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
            return membrane.getReactiveProxy(vm.cmpTrack)[key];
        },
        set(this: VMElement, newValue: any) {
            const vm = getCustomElementVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${key}`);
            }
            membrane.getReactiveProxy(vm.cmpTrack)[key] = newValue;
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
        configurable: false,
    });
}
