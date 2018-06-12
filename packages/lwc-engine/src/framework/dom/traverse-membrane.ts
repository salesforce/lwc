import { isNull, hasOwnProperty, ArrayMap, isUndefined, isFunction } from "../language";
import { shadowDescriptors } from "./traverse";
import { ViewModelReflection } from "../utils";
import { fallbackDescriptors } from "../html-element";
const proxies = new WeakMap<object, object>();


// We ONLY want to have DOM nodes and DOM methods
// going into the traverse membrane. This check is
// a little too broad, because any function that passes
// through here will be inserted into the membrane,
// but the only case where this would happen would be:
// node()(), so this should be sufficient for now.
function isReplicable(value: any): boolean {
    return value instanceof Node || isFunction(value);
}

const traverseMembraneHandler = {
    get(originalTarget: any, key: PropertyKey): any {
        if (key === TargetSlot) {
            return originalTarget;
        }

        // We have to check if we are dealing with a custom or native element
        // The shadow descriptors are different depending on whether we have a custom element
        // or native, so we have to get the correct descriptors accordingly.
        const descriptors = isUndefined(originalTarget[ViewModelReflection]) ? shadowDescriptors : fallbackDescriptors;
        if (hasOwnProperty.call(descriptors, key)) {
            const descriptor = descriptors[key];
            if (hasOwnProperty.call(descriptor, 'value')) {
                return wrap(descriptor.value);
            } else {
                return descriptor!.get!.call(originalTarget);
            }
        } else {
            return wrap(originalTarget[key]);
        }
    },
    apply(originalTarget: (...any) => any, thisArg: any, args: any[]): any {
        const unwrappedContext = unwrap(thisArg);
        const unwrappedArgs = ArrayMap.call(args, (arg) => unwrap(arg));
        const value = originalTarget.apply(unwrappedContext, unwrappedArgs);
        return wrap(value);
    }
};

const TargetSlot = Symbol();

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey: ProxyGetKey } = Proxy;
const getKey = ProxyGetKey ? ProxyGetKey : (o: any, key: PropertyKey): any => o[key];
export function unwrap(value: object | undefined | null) {
    return (value && getKey(value, TargetSlot)) || value;
}

export function contains(value: any) {
    return proxies.has(value);
}

export function wrap(value: any) {
    if (isNull(value)) {
        return value;
    }
    const unwrapped = unwrap(value);
    if (!isReplicable(unwrapped)) {
        return unwrapped;
    }
    const r = proxies.get(unwrapped);
    if (r) {
        return r;
    }
    const proxy = new Proxy(unwrapped, traverseMembraneHandler);
    proxies.set(unwrapped, proxy);
    return proxy;
}
