type XProxyTargetFunction = (...args: Array<any>) => any;
type XProxyTargetConstructor = {
    new(...args: Array<any>): object;
}
type XProxyTarget = (object | Array<any> | XProxyTargetFunction | XProxyTargetConstructor) & {
    [key: string]: any;
}
type XProxyHandler<T extends object> = ProxyHandler<T> & {
    [key: string]: any
}

interface XProxyInstance {

}

// RFC4122 version 4 uuid
export const ProxySlot = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});
export const ArraySlot = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});
export const ProxyIdentifier = function ProxyCompat() {};

const {
    create,
    defineProperty,
    defineProperties,
    isExtensible,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertySymbols,
    getOwnPropertyNames,
    preventExtensions,
} = Object;

const {
    slice: ArraySlice,
} = Array.prototype;

const { isArray } = Array;

// Proto chain check might be needed because of usage of a limited polyfill
// https://github.com/es-shims/get-own-property-symbols
// In this case, because this polyfill is assing all the stuff to Object.prototype to keep
// all the other invariants of Symbols, we need to do some manual checks here for the slow patch.
export const inOperator = typeof Symbol() === 'object' ? function inOperatorCompat(obj: any, key: PropertyKey): boolean {
    if (key && key.constructor === Symbol) {
        while (obj) {
            if (getOwnPropertySymbols(obj).indexOf(key as symbol) !== -1) {
                return true;
            }
            obj = getPrototypeOf(obj);
        }
        return false;
    }
    return key in obj;
} : function inOperator(obj: any, key: PropertyKey): boolean {
    return key in obj;
}

const defaultHandlerTraps: XProxyHandler<object> = {
    get(target: XProxyTarget, key: PropertyKey): any {
        return target[key];
    },
    set(target: XProxyTarget, key: PropertyKey, newValue: any): boolean {
        target[key] = newValue;
        return true;
    },
    apply(targetFn: XProxyTargetFunction, thisArg: any, argumentsList: Array<any>): any {
        return targetFn.apply(thisArg, argumentsList);
    },
    construct(targetFn: XProxyTargetConstructor, argumentsList: Array<any>, newTarget: any): any {
        return new targetFn(...argumentsList);
    },
    defineProperty(target: XProxyTarget, property: PropertyKey, descriptor: PropertyDescriptor): boolean {
        defineProperty(target, property, descriptor);
        return true;
    },
    deleteProperty(target: XProxyTarget, property: PropertyKey): boolean {
        return delete target[property];
    },
    ownKeys(target: XProxyTarget): Array<string> {
        // Note: we don't need to worry about symbols here since Symbol and Proxy go hand to hand
        return getOwnPropertyNames(target);
    },
    has(target: XProxyTarget, propertyKey: PropertyKey): boolean {
        return inOperator(target, propertyKey);
    },
    preventExtensions(target: XProxyTarget): boolean {
        preventExtensions(target);
        return true;
    },
    getOwnPropertyDescriptor,
    getPrototypeOf,
    isExtensible,
    setPrototypeOf,
};

let lastRevokeFn: () => void;

type ProxyTrapFalsyErrorsMap = {
    [key: string]: (...args: any[]) => void
}
const proxyTrapFalsyErrors: ProxyTrapFalsyErrorsMap = {
    set(target: XProxyTarget, key: PropertyKey) {
        throw new TypeError(`'set' on proxy: trap returned falsish for property '${key}'`);
    },
    deleteProperty(target: XProxyTarget, key: PropertyKey) {
        throw new TypeError(`'deleteProperty' on proxy: trap returned falsish for property '${key}'`);
    },
    setPrototypeOf(target: XProxyTarget, proto: any) {
        throw new TypeError(`'setPrototypeOf' on proxy: trap returned falsish`);
    },
    preventExtensions(target: XProxyTarget, proto: any) {
        throw new TypeError(`'preventExtensions' on proxy: trap returned falsish`);
    },
    defineProperty(target: XProxyTarget, key: PropertyKey, descriptor: PropertyDescriptor) {
        throw new TypeError(`'defineProperty' on proxy: trap returned falsish for property '${key}'`);
    }
}

export class XProxy implements XProxyInstance {
    constructor (target: XProxyTarget, handler: XProxyHandler<object>) {
        const targetIsFunction = typeof target === 'function';
        const targetIsArray = isArray(target);
        if (typeof target !== 'object' && !targetIsFunction) {
            throw new Error(`Cannot create proxy with a non-object as target`);
        }
        if (typeof handler !== 'object' || handler === null) {
            throw new Error(`new XProxy() expects the second argument to an object`);
        }

        // Construct revoke function, and set lastRevokeFn so that Proxy.revocable can steal it.
        // The caller might get the wrong revoke function if a user replaces or wraps XProxy
        // to call itself, but that seems unlikely especially when using the polyfill.
        let throwRevoked = false;
        lastRevokeFn = function () {
            throwRevoked = true;
        };
        const revocableHandler: ProxyHandler<object> = {};

        // Define proxy as Object, or Function (if either it's callable, or apply is set).
        let proxy = this; // reusing the already created object, eventually the prototype will be resetted
        if (targetIsFunction) {
            proxy = function Proxy() {
                const usingNew = (this && this.constructor === proxy);
                const args = ArraySlice.call(arguments);
                if (usingNew) {
                    return proxy.construct.call(revocableHandler, args, this);
                } else {
                    return proxy.apply.call(revocableHandler, this, args);
                }
            };
        }

        setPrototypeOf(proxy, getPrototypeOf(target));

        if (targetIsArray) {
            defineProperty(proxy, ArraySlot, {
                value: ProxyIdentifier, // mark to identify Array
                writable: true,
                enumerable: false,
                configurable: false,
            });

            defineProperty(proxy, 'length', {
                enumerable: false,
                configurable: true,
                get: () => {
                    return proxy.get(target, 'length');
                },
                set: (value: any): any => {
                    return proxy.set(target, 'length', value);
                },
            });
        }

        for (let trapName in defaultHandlerTraps) {
            defineProperty(proxy, trapName, {
                value: function () {
                    if (throwRevoked) {
                        throw new TypeError(`Cannot perform '${trapName}' on a proxy that has been revoked`);
                    }
                    const args = ArraySlice.call(arguments);
                    args.unshift(target);
                    const h = handler[trapName] ? handler : defaultHandlerTraps;
                    const value = h[trapName].apply(h, args);
                    if (proxyTrapFalsyErrors[trapName] && value === false) {
                        proxyTrapFalsyErrors[trapName].apply(proxyTrapFalsyErrors, args);
                    }
                    return value;
                },
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }

        defineProperty(proxy, ProxySlot, {
            value: ProxyIdentifier,
            configurable: false,
            enumerable: false,
            writable: false,
        });

        defineProperty(proxy, 'forIn', {
            value: () => {
                const keyedObj = create(null);
                for (let i in target) {
                    keyedObj[i] = void 0;
                }
                return keyedObj;
            },
            configurable: false,
            enumerable: false,
            writable: false,
        });

        return proxy;
    }

    static revocable (target: XProxyTarget, handler: ProxyHandler<object>) {
        const p = new XProxy(target, handler);
        return {
            proxy: p,
            revoke: lastRevokeFn,
        };
    }

    static reify (proxy: XProxy, descriptorMap: PropertyDescriptorMap) {
        if (proxy[ProxySlot] !== ProxyIdentifier) {
            throw new Error(`Cannot reify ${proxy}. ${proxy} is not a valid compat Proxy instance.`);
        }
        defineProperties(proxy, descriptorMap);
    }

    [key: string]: any;
};