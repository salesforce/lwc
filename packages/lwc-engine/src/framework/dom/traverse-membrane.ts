import { isNull, hasOwnProperty, ArrayMap, isFunction } from "../language";
import { ElementPatchDescriptors, NodePatchDescriptors, SlotPatchDescriptors } from "./traverse";
import { createSymbol } from "../utils";
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

        const { tagName } = originalTarget;
        let descriptors: PropertyDescriptorMap;
        switch (tagName) {
            case undefined:
                // node
                descriptors = NodePatchDescriptors;
                break;
            case 'SLOT':
                // slot
                descriptors = SlotPatchDescriptors;
                break;
            default:
                // element
                descriptors = ElementPatchDescriptors;
        }
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
    set(originalTarget: any, key: PropertyKey, value: any): boolean {
        if (key === TargetSlot) {
            return false;
        }
        originalTarget[key] = unwrap(value);
        return true;
    },
    apply(originalTarget: (...any) => any, thisArg: any, args: any[]): any {
        const unwrappedContext = unwrap(thisArg);
        const unwrappedArgs = ArrayMap.call(args, (arg) => unwrap(arg));
        const value = originalTarget.apply(unwrappedContext, unwrappedArgs);
        return wrap(value);
    }
};

const TargetSlot = createSymbol('targetSlot');

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore: getting getKey from Proxy intrinsic
const { getKey: ProxyGetKey } = Proxy;

const getKey = ProxyGetKey ? ProxyGetKey : (o: any, key: PropertyKey): any => o[key];
export function unwrap(value: object | undefined | null) {
    return (value && getKey(value, TargetSlot)) || value;
}

export function contains(value: any) {
    return proxies.has(value);
}

export function wrap(value: any): any {
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
