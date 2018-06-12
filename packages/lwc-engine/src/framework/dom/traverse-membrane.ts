import { isNull, hasOwnProperty, ArrayMap } from "../language";
import { shadowDescriptors } from "./traverse";
import { ViewModelReflection } from "../utils";
import { fallbackDescriptors } from "../html-element";
const proxies = new WeakMap<object, object>();

function isReplicable(value: any): boolean {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}

const traverseMembraneHandler = {
    get(originalTarget: any, key: PropertyKey): any {
        if (key === TargetSlot) {
            return originalTarget;
        }
        let value;
        const descriptors = originalTarget[ViewModelReflection] ? fallbackDescriptors : shadowDescriptors;
        if (hasOwnProperty.call(descriptors, key)) {
            const descriptor = descriptors[key];
            if (hasOwnProperty.call(descriptor, 'value')) {
                value = wrap(descriptor.value);
            } else {
                value = descriptor!.get!.call(originalTarget);
            }
        } else {
            value = originalTarget[key];
        }

        return value;
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
