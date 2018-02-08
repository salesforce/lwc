import {
    toString,
    isUndefined,
    TargetSlot,
    unwrap,
    isObservable,
} from './shared';

import {
    ReactiveMembrane,
    notifyMutation,
    observeMutation,
} from './reactive-membrane';

export type ShadowTarget = (object | any[]);

const { isArray } = Array;
const {
    getPrototypeOf,
    isExtensible,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    defineProperty,
    preventExtensions,
} = Object;

const {
    concat: ArrayConcat,
} = Array.prototype;

function wrapDescriptor(membrane: ReactiveMembrane, descriptor: PropertyDescriptor): PropertyDescriptor {
    if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? membrane.getReadOnlyProxy(descriptor.value) : descriptor.value;
    }
    return descriptor;
}

export class ReadOnlyHandler {
    originalTarget: any;
    membrane: ReactiveMembrane;
    constructor(membrane: ReactiveMembrane, value: any) {
        this.originalTarget = value;
        this.membrane = membrane;
    }
    get(shadowTarget: ShadowTarget, key: PropertyKey): any {
        const { membrane, originalTarget } = this;
        if (key === TargetSlot) {
            return originalTarget;
        }
        const value = originalTarget[key];
        observeMutation(membrane, originalTarget, key);
        return membrane.getReadOnlyProxy(value);
    }
    set(shadowTarget: ShadowTarget, key: PropertyKey, value: any): boolean {
        throw new Error();
    }
    deleteProperty(shadowTarget: ShadowTarget, key: PropertyKey): boolean {
        throw new Error();
    }
    apply(shadowTarget: ShadowTarget/*, thisArg: any, argArray?: any*/) {

    }
    construct(shadowTarget: ShadowTarget, argArray: any, newTarget?: any): any {

    }

    has(shadowTarget: ShadowTarget, key: PropertyKey): boolean {
        const { membrane, originalTarget } = this;
        observeMutation(membrane, originalTarget, key);
        return key in originalTarget;
    }
    ownKeys(shadowTarget: ShadowTarget): string[] {
        const { originalTarget } = this;
        return ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    }
    setPrototypeOf(shadowTarget: ShadowTarget, prototype: any): any {
        throw new Error();
    }
    getOwnPropertyDescriptor(shadowTarget: ShadowTarget, key: PropertyKey): PropertyDescriptor | undefined {
        const { originalTarget, membrane } = this;

        // keys looked up via hasOwnProperty need to be reactive
        observeMutation(membrane, originalTarget, key);

        let desc = getOwnPropertyDescriptor(originalTarget, key);
        if (isUndefined(desc)) {
            return desc;
        }
        const shadowDescriptor = getOwnPropertyDescriptor(shadowTarget, key);
        if (!desc.configurable && !shadowDescriptor) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            desc = wrapDescriptor(membrane, desc);
            defineProperty(shadowTarget, key, desc);
        }
        return shadowDescriptor || desc;
    }
    preventExtensions(shadowTarget: ShadowTarget): boolean {
        throw new Error();
    }
    defineProperty(shadowTarget: ShadowTarget, key: PropertyKey, descriptor: PropertyDescriptor): boolean {
        throw new Error();
    }
}