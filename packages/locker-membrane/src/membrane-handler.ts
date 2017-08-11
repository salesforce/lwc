import {
    getOwnPropertyNames,
    getOwnPropertyDescriptor,
    defineProperty,
    preventExtensions,
    isArray,
    ArrayMap,
    isExtensible,
    getPrototypeOf,
    TargetSlot,
    MembraneSlot,
    setPrototypeOf,
    hasOwnProperty
} from './shared';

import { Membrane, unwrap, invokeDistortion } from './membrane';

/*eslint-disable*/
type MembraneShadowTarget = Object | Array<any> | Function;
/*eslint-enable*/

function lockShadowTarget(membrane: Membrane, shadowTarget: MembraneShadowTarget, originalTarget: any): void {
    const targetKeys = getOwnPropertyNames(originalTarget);
    targetKeys.forEach((key) => {
        let descriptor = getOwnPropertyDescriptor(originalTarget, key);

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

function wrapDescriptor(membrane: Membrane, descriptor: PropertyDescriptor): PropertyDescriptor {
    if ('value' in descriptor) {
        descriptor.value = invokeDistortion(membrane, descriptor.value);
    } else {
        if ('get' in descriptor) {
            descriptor.get = invokeDistortion(membrane, descriptor.get);
        }
        if ('set' in descriptor) {
            descriptor.set = invokeDistortion(membrane, descriptor.set);
        }
    }

    return descriptor;
}

function unwrapDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor {
    if ('value' in descriptor) {
        descriptor.value = unwrap(descriptor.value);
    } else {
        if ('get' in descriptor) {
            descriptor.get = unwrap(descriptor.get);
        }
        if ('set' in descriptor) {
            descriptor.set = unwrap(descriptor.set);
        }
    }
    return descriptor;
}

export class MembraneHandler {
    originalTarget: any; // eslint-disable-line no-undef
    membrane: Membrane; // eslint-disable-line no-undef
    constructor(membrane: Membrane, originalTarget: any) {
        this.membrane = membrane;
        this.originalTarget = originalTarget;
    }
    get(shadowTarget: MembraneShadowTarget, key: PropertyKey, receiver: any): any { // eslint-disable-line no-unused-vars
        if (key === MembraneSlot) {
            return this;
        }
        const { originalTarget, membrane } = this;
        if (key === TargetSlot) {
            return originalTarget;
        }
        const value = originalTarget[key];
        return invokeDistortion(membrane, value);
    }
    set(shadowTarget: MembraneShadowTarget, key: PropertyKey, newValue: any): boolean {
        const { originalTarget } = this;
        originalTarget[key] = unwrap(newValue);
        return true;
    }
    deleteProperty(shadowTarget: MembraneShadowTarget, key: PropertyKey): boolean {
        const { originalTarget } = this;
        delete originalTarget[key];
        return true;
    }
    apply(shadowTarget: MembraneShadowTarget, thisArg: any, argumentsList: Array<any>): any {
        const { originalTarget, membrane } = this;
        thisArg = unwrap(thisArg);
        argumentsList = ArrayMap.call(argumentsList, unwrap);
        const returnValue = originalTarget.apply(thisArg, argumentsList);
        return invokeDistortion(membrane, returnValue);
    }
    construct(targetFn: MembraneShadowTarget, argumentsList: Array<any>, newTarget: any): any { // eslint-disable-line no-unused-vars
        const { originalTarget: OriginalConstructor, membrane } = this;
        argumentsList = unwrap(argumentsList);
        if (isArray(argumentsList)) {
            argumentsList = ArrayMap.call(argumentsList, unwrap);
        }
        return invokeDistortion(membrane, new OriginalConstructor(...argumentsList));
    }
    has(shadowTarget: MembraneShadowTarget, key: PropertyKey): boolean {
        const { originalTarget } = this;
        return key in originalTarget;
    }
    ownKeys(shadowTarget: MembraneShadowTarget): Array<string> { // eslint-disable-line no-unused-vars
        const { originalTarget } = this;
        return getOwnPropertyNames(originalTarget);
    }
    isExtensible(shadowTarget: MembraneShadowTarget): boolean {
        const shadowIsExtensible = isExtensible(shadowTarget);

        if (!shadowIsExtensible) {
            return shadowIsExtensible;
        }

        const { originalTarget } = this;
        const targetIsExtensible = isExtensible(originalTarget);

        if (!targetIsExtensible) {
            const { membrane } = this;
            lockShadowTarget(membrane, shadowTarget, originalTarget);
        }

        return targetIsExtensible;
    }
    setPrototypeOf(shadowTarget: MembraneShadowTarget, prototype: any) { // eslint-disable-line no-unused-vars
        const { originalTarget } = this;
        return setPrototypeOf(originalTarget, prototype);
    }
    getPrototypeOf(shadowTarget: MembraneShadowTarget): Object { // eslint-disable-line no-unused-vars
        const { originalTarget } = this;
        return getPrototypeOf(originalTarget);
    }
    getOwnPropertyDescriptor(shadowTarget: MembraneShadowTarget, key: PropertyKey): PropertyDescriptor {
        const { originalTarget, membrane } = this;
        let desc = getOwnPropertyDescriptor(originalTarget, key);
        if (!desc) {
            return desc;
        }
        desc = wrapDescriptor(membrane, desc);
        if (!desc.configurable && !(hasOwnProperty.call(shadowTarget, key))) {
            // If descriptor from original target is not configurable,
            // We must copy the wrapped descriptor over to the shadow target.
            // Otherwise, proxy will throw an invariant error.
            // This is our last chance to lock the value.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor#Invariants
            defineProperty(shadowTarget, key, desc);
        }
        return desc;
    }
    preventExtensions(shadowTarget: MembraneShadowTarget): boolean {
        const { originalTarget, membrane } = this;
        lockShadowTarget(membrane, shadowTarget, originalTarget);
        preventExtensions(originalTarget);
        return true;
    }
    defineProperty(shadowTarget: MembraneShadowTarget, key: PropertyKey, descriptor: PropertyDescriptor): boolean {
        const { originalTarget } = this;
        const { configurable } = descriptor;
        const unwrappedDescriptor = unwrapDescriptor(descriptor);
        if (configurable === false) {
            defineProperty(shadowTarget, key, descriptor);
        }
        defineProperty(originalTarget, key, unwrappedDescriptor);
        return true;
    }
}