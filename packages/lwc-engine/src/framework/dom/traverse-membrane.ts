import { isNull, hasOwnProperty, ArrayMap, isArray, isObject, isFunction } from "../language";
import { shadowDescriptors } from "./traverse";
import { ViewModelReflection } from "../utils";
const proxies = new WeakMap<object, object>();
type MembraneShadowTarget = Object | any[] | ((...args) => any);

function createShadowTarget(value: any): MembraneShadowTarget {
    let shadowTarget: MembraneShadowTarget | undefined = undefined;
    if (isArray(value)) {
        shadowTarget = [];
    } else if (isObject(value)) {
        shadowTarget = {};
    } else if (isFunction(value)) {
        shadowTarget = () => {}; // tslint:disable-line
    }
    return shadowTarget as MembraneShadowTarget;
}

function isReplicable(value: any): boolean {
    const type = typeof value;
    return value && (type === 'object' || type === 'function');
}

class TraverseMembraneHandler {
    originalTarget: any;
    constructor(originalTarget: any) {
        this.originalTarget = originalTarget;
    }
    get(shadowTarget: any, key: PropertyKey): any {
        const { originalTarget } = this;
        if (key === TargetSlot) {
            return originalTarget;
        } else if (key === ViewModelReflection) {
            return originalTarget[key];
        }
        let value;
        if (hasOwnProperty.call(shadowDescriptors, key)) {
            const descriptor = shadowDescriptors[key];
            if (hasOwnProperty.call(descriptor, 'value')) {
                value = descriptor.value;
            } else {
                value = descriptor!.get!.call(originalTarget);
            }
        } else {
            value = originalTarget[key]
        }

        return wrap(value);
    }
    apply(target: (...any) => any, thisArg: any, args: any[]): any {
        const { originalTarget } = this;
        const unwrappedContext = unwrap(thisArg);
        const unwrappedArgs = ArrayMap.call(args, (arg) => unwrap(arg));
        const value = originalTarget.apply(unwrappedContext, unwrappedArgs);
        return wrap(value);
    }
}

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
    const proxy = new Proxy(createShadowTarget(unwrapped), new TraverseMembraneHandler(unwrapped));
    proxies.set(unwrapped, proxy);
    return proxy;
}
