import {setInternalField, getInternalField, hasNativeSymbolsSupport } from './fields';

// Each association type will get a different WeakMap
const associations: object = {};
// Store associations that should be hidden from outside world
export const setHiddenAssociation = hasNativeSymbolsSupport
    ? (o: object, fieldName: symbol, value: any): void =>  {
        let associationMap = associations[fieldName];
        if (!associationMap) {
            associationMap = new WeakMap();
            associations[fieldName] = associationMap;
        }
        associationMap.set(o, value);
    }
    : setInternalField; // Fall back to symbol based approach in compat mode

export const getHiddenAssociation = hasNativeSymbolsSupport
    ? (o: object, fieldName: symbol): any => {
        const associationMap = associations[fieldName];
        return associationMap && associationMap.get(o);
    }
    : getInternalField; // Fall back to symbol based approach in compat mode
