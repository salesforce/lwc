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

// Unwrap property descriptors
// We only need to unwrap if value is specified
function unwrapDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor {
    if ('value' in descriptor) {
        descriptor.value = unwrap(descriptor.value);
    }
    return descriptor;
}

function wrapDescriptor(membrane: ReactiveMembrane, descriptor: PropertyDescriptor): PropertyDescriptor {
    if ('value' in descriptor) {
        descriptor.value = isObservable(descriptor.value) ? membrane.getReactiveProxy(descriptor.value) : descriptor.value;
    }
    return descriptor;
}


function lockShadowTarget(membrane: ReactiveMembrane, shadowTarget: ShadowTarget, originalTarget: any): void {
    const targetKeys = ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    targetKeys.forEach((key: PropertyKey) => {
        let descriptor = getOwnPropertyDescriptor(originalTarget, key) as PropertyDescriptor;

        // We do not need to wrap the descriptor if not configurable
        // Because we can deal with wrapping it when user goes through
        // Get own property descriptor. There is also a chance that this descriptor
        // could change sometime in the future, so we can defer wrapping
        // until we need to
        if (!descriptor.configurable) {
            descriptor = wrapDescriptor(membrane, descriptor);
        }
        defineProperty(shadowTarget, key, descriptor);
    });

    preventExtensions(shadowTarget);
}

export class ReactiveProxyHandler {
    originalTarget: any;
    membrane: ReactiveMembrane;
    constructor(membrane: ReactiveMembrane, value: any) {
        this.originalTarget = value;
        this.membrane = membrane;
    }
    get(shadowTarget: ShadowTarget, key: PropertyKey): any {
        const { originalTarget, membrane } = this;
        if (key === TargetSlot) {
            return originalTarget;
        }
        const value = originalTarget[key];
        observeMutation(membrane, originalTarget, key);
        return membrane.getReactiveProxy(value);
    }
    set(shadowTarget: ShadowTarget, key: PropertyKey, value: any): boolean {
        const { originalTarget, membrane } = this;
        const oldValue = originalTarget[key];
        if (oldValue !== value) {
            originalTarget[key] = value;
            notifyMutation(membrane, originalTarget, key);
        } else if (key === 'length' && isArray(originalTarget)) {
            // fix for issue #236: push will add the new index, and by the time length
            // is updated, the internal length is already equal to the new length value
            // therefore, the oldValue is equal to the value. This is the forking logic
            // to support this use case.
            notifyMutation(membrane, originalTarget, key);
        }
        return true;
    }
    deleteProperty(shadowTarget: ShadowTarget, key: PropertyKey): boolean {
        const { originalTarget, membrane } = this;
        delete originalTarget[key];
        notifyMutation(membrane, originalTarget, key);
        return true;
    }
    apply(target: any/*, thisArg: any, argArray?: any*/) {

    }
    construct(target: any, argArray: any, newTarget?: any): any {

    }

    has(shadowTarget: ShadowTarget, key: PropertyKey): boolean {
        const { originalTarget, membrane } = this;
        observeMutation(membrane, originalTarget, key);
        return key in originalTarget;
    }
    ownKeys(shadowTarget: ShadowTarget): string[] {
        const { originalTarget } = this;
        return ArrayConcat.call(getOwnPropertyNames(originalTarget), getOwnPropertySymbols(originalTarget));
    }
    isExtensible(shadowTarget: ShadowTarget): boolean {
        const shadowIsExtensible = isExtensible(shadowTarget);

        if (!shadowIsExtensible) {
            return shadowIsExtensible;
        }

        const { originalTarget, membrane } = this;
        const targetIsExtensible = isExtensible(originalTarget);

        if (!targetIsExtensible) {
            lockShadowTarget(membrane, shadowTarget, originalTarget);
        }

        return targetIsExtensible;
    }
    setPrototypeOf(shadowTarget: ShadowTarget, prototype: any): any {

    }
    getPrototypeOf(shadowTarget: ShadowTarget): object {
        const { originalTarget } = this;
        return getPrototypeOf(originalTarget);
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
        const { originalTarget, membrane } = this;
        lockShadowTarget(membrane, shadowTarget, originalTarget);
        preventExtensions(originalTarget);
        return true;
    }
    defineProperty(shadowTarget: ShadowTarget, key: PropertyKey, descriptor: PropertyDescriptor): boolean {
        const { originalTarget, membrane } = this;
        const { configurable } = descriptor;

        // We have to check for value in descriptor
        // because Object.freeze(proxy) calls this method
        // with only { configurable: false, writeable: false }
        // Additionally, method will only be called with writeable:false
        // if the descriptor has a value, as opposed to getter/setter
        // So we can just check if writable is present and then see if
        // value is present. This eliminates getter and setter descriptors
        if ('writable' in descriptor && !('value' in descriptor)) {
            const originalDescriptor = getOwnPropertyDescriptor(originalTarget, key) as PropertyDescriptor;
            descriptor.value = originalDescriptor.value;
        }
        defineProperty(originalTarget, key, unwrapDescriptor(descriptor));
        if (configurable === false) {
            defineProperty(shadowTarget, key, wrapDescriptor(membrane, descriptor));
        }

        notifyMutation(membrane, originalTarget, key);
        return true;
    }
}