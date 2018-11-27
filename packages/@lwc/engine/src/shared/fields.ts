import { defineProperty, create } from "./language";

/**
 * In IE11, symbols are expensive.
 * Due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported. Note that we can't use typeof since it will fail when tranpiling.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createFieldName(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return hasNativeSymbolsSupport ? Symbol(key) : `$$lwc-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: improve this to use  or a WeakMap
    defineProperty(o, fieldName, {
        value,
    });
}

export function getInternalField(o: object, fieldName: symbol): any {
    return o[fieldName];
}

/**
 * Store associations that should be hidden from outside world
 * privateAssociations is a WeakMap.
 * It stores a hash of any given objects associative relationships.
 * The hash uses the fieldName as the key, the value represents the other end of the association.
 *
 * For example, if the association is
 *              ViewModel
 * Component-A --------------> VM-1
 * then,
 * privateAssociations : (Component-A, { Symbol(ViewModel) : VM-1 })
 *
 */
const privateAssociations: WeakMap<object, object> = new WeakMap();
export const setHiddenAssociation = hasNativeSymbolsSupport
    ? (o: object, fieldName: symbol, value: any): void =>  {
        let associationByField = privateAssociations.get(o);
        if (!associationByField) {
            associationByField = create(null);
            privateAssociations.set(o, associationByField!);
        }
        associationByField![fieldName] = value;
    }
    : setInternalField; // Fall back to symbol based approach in compat mode

export const getHiddenAssociation = hasNativeSymbolsSupport
    ? (o: object, fieldName: symbol): any => {
        const associationByField = privateAssociations.get(o);
        return associationByField && associationByField[fieldName];
    }
    : getInternalField; // Fall back to symbol based approach in compat mode
