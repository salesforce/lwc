import { defineProperty } from "./language";

/**
 * In IE11, symbols that we plan to apply everywhere are expensive
 * due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createFieldName(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return hasNativeSymbolsSupport ? Symbol(key) : `$$lwc-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: improve this to use  or a WeakMap
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the internal fields
        defineProperty(o, fieldName, {
            value,
            enumerable: true,
            configurable: false,
            writable: false,
        });
    } else {
        // in prod, for better perf, we just let it roll
        o[fieldName] = value;
    }
}

export function getInternalField(o: object, fieldName: symbol): any {
    return o[fieldName];
}
