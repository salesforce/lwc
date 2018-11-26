import {setInternalField, getInternalField } from './fields';

const isCompatMode =  'getKey' in Proxy;
// Each association type will get a different WeakMap
const associations: object = {};
// Store associations that should be hidden from outside world
export const setHiddenAssociation = !isCompatMode
    ? (o: object, fieldName: symbol, value: any): void =>  {
        let associationMap = associations[fieldName];
        if (!associationMap) {
            associationMap = new WeakMap();
            associations[fieldName] = associationMap;
        }
        associationMap.set(o, value);
    }
    : setInternalField; // Fall back to symbol based approach in compat mode

export const getHiddenAssociation = !isCompatMode
    ? (o: object, fieldName: symbol): any => {
        const associationMap = associations[fieldName];
        return associationMap && associationMap.get(o);
    }
    : getInternalField; // Fall back to symbol based approach in compat mode
