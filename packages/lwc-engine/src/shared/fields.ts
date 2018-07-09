/**
 * In IE11, symbols that we plan to apply everywhere are expensive
 * due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported.
 */
export function createFieldName(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return typeof Symbol() === 'symbol' ? Symbol(key) : `$$lwc-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: improve this to use defineProperty(o, fieldName, { value }) or a WeakMap
    o[fieldName] = value;
}

export function getInternalField(o: object, fieldName: symbol): any {
    return o[fieldName];
}
