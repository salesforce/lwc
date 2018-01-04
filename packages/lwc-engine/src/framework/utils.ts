import assert from "./assert";
import { create, seal, ArrayPush, freeze, isFunction, isString, ArrayIndexOf } from "./language";

let nextTickCallbackQueue: Array<Callback> = [];
const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);

function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(nextTickCallbackQueue.length, `If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of ${nextTickCallbackQueue}.`);
    }
    const callbacks: Array<Callback> = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}

export function addCallbackToNextTick(callback: Callback) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isFunction(callback), `addCallbackToNextTick() can only accept a function callback as first argument instead of ${callback}`);
    }
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    // TODO: eventually, we might want to have priority when inserting callbacks
    ArrayPush.call(nextTickCallbackQueue, callback);
}

const CAMEL_REGEX = /-([a-z])/g;
const attrNameToPropNameMap = create(null);

export function getPropNameFromAttrName(attrName: string): string {
    let propName = attrNameToPropNameMap[attrName];
    if (!propName && isString(attrName)) {
        propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}

const CAPS_REGEX = /[A-Z]/g;
import {
    HTMLPropertyNamesWithLowercasedReflectiveAttributes,
} from "./dom";

/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
export function getAttrNameFromPropName(propName: string): string {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }

    // these are exceptions to the rule that cannot be inferred via `CAPS_REGEX`,
    switch (propName) {
        case 'className':
            return 'class';
        case 'htmlFor':
            return 'for';
        default:
            // Few more exceptions where the attribute name matches the property in lowercase.
            if (ArrayIndexOf.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, propName) >= 0) {
                propName.toLocaleLowerCase()
            }
    }
    // otherwise we do the regular canonical transformation.
    return propName.replace(CAPS_REGEX, (match: string): string => '-' + match.toLowerCase());
}
export const usesNativeSymbols = typeof Symbol() === 'symbol';
export function noop() {}

const classNameToClassMap = create(null);

export function getMapFromClassName(className: string): HashTable<boolean> {
    let map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    let start = 0;
    let i, len = className.length;
    for (i = 0; i < len; i++) {
        if (className.charCodeAt(i) === SPACE_CHAR) {
            if (i > start) {
                map[className.slice(start, i)] = true;
            }
            start = i + 1;
        }
    }

    if (i > start) {
        map[className.slice(start, i)] = true;
    }
    classNameToClassMap[className] = map;
    if (process.env.NODE_ENV !== 'production') {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    }
    return map;
}
