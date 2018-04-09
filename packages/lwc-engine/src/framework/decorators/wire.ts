import assert from "../assert";
import { VM, VMElement, HashTable } from "../vm";
import { ViewModelReflection } from "../def";
import { defineProperty, isUndefined } from "../language";
import { observeMutation } from "../watcher";
import { getCustomElementVM } from "../html-element";

// stub function to prevent misuse of the @wire decorator
export default function wire() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail("@wire may only be used as a decorator.");
    }
}
// TODO: how to allow symbols as property keys?
export function createWiredPropertyDescriptor(proto: object, key: string, descriptor: PropertyDescriptor | undefined) {
    defineProperty(proto, key, {
        get(this: VMElement): any {
            const vm = getCustomElementVM(this);
            observeMutation(this, key);
            return (vm.wireValues as HashTable<any>)[key];
        },
        set(this: VMElement, newValue: any) {
            // if (process.env.NODE_ENV !== 'production') {
            //     throw new Error('setting a wired property is invalid');
            // }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
        configurable: false,
    });
}
