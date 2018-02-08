import {
    toString,
    isUndefined,
    TargetSlot,
    unwrap,
    isObservable,
    ArrayMap,
} from './shared';

import {
    ReactiveMembrane,
    notifyMutation,
    observeMutation,
    ReactiveMembraneShadowTarget,
} from './reactive-membrane';

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
    get(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey): any {
        const { membrane, originalTarget } = this;
        if (key === TargetSlot) {
            return originalTarget;
        }
        const value = originalTarget[key];
        observeMutation(membrane, originalTarget, key);
        return membrane.getReadOnlyProxy(value);
    }
    set(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey, value: any): boolean {
        throw new Error();
    }
    deleteProperty(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey): boolean {
        throw new Error();
    }
    apply(shadowTarget: ReactiveMembraneShadowTarget, thisArg: any, argArray: any[]) {
        const { originalTarget, membrane } = this;
        thisArg = unwrap(thisArg);
        const returnValue = originalTarget.apply(thisArg, argArray);
        return membrane.getReadOnlyProxy(returnValue);
    }
    construct(target: ReactiveMembraneShadowTarget, argArray: any, newTarget?: any): any {
        const { originalTarget: OriginalConstructor, membrane } = this;
        argArray = ArrayMap.call(argArray, unwrap);
        const instance = new OriginalConstructor(...argArray);
        return membrane.getReadOnlyProxy(instance);
    }
    has(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey): boolean {
        const { membrane, originalTarget } = this;
        observeMutation(membrane, originalTarget, key);
        return key in originalTarget;
    }
    ownKeys(shadowTarget: ReactiveMembraneShadowTarget): string[] {
        const { originalTarget } = this;
        return ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    }
    setPrototypeOf(shadowTarget: ReactiveMembraneShadowTarget, prototype: any): any {
        throw new Error();
    }
    getOwnPropertyDescriptor(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey): PropertyDescriptor | undefined {
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
    preventExtensions(shadowTarget: ReactiveMembraneShadowTarget): boolean {
        throw new Error();
    }
    defineProperty(shadowTarget: ReactiveMembraneShadowTarget, key: PropertyKey, descriptor: PropertyDescriptor): boolean {
        throw new Error();
    }
}