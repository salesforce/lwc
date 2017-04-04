import assert from "./assert.js";
import { isArray, create, ArrayPush } from "./language.js";

let nextTickCallbackQueue = undefined;
const SPACE_CHAR = 32;

export function addCallbackToNextTick(callback: any) {
    assert.isTrue(typeof callback === 'function', `addCallbackToNextTick() can only accept a function callback as first argument instead of ${callback}`);
    if (!isArray(nextTickCallbackQueue)) {
        nextTickCallbackQueue = [];
        Promise.resolve(nextTickCallbackQueue).then((callbacks: Array<Callback>) => {
            assert.isTrue(isArray(callbacks), `${callbacks} must be the array of callbacks`);
            nextTickCallbackQueue = undefined;
            for (let i = 0, len = callbacks.length; i < len; i += 1) {
                callbacks[i]();
            }
        });
    }
    ArrayPush.call(nextTickCallbackQueue, callback);
}

const CAMEL_REGEX = /-([a-z])/g;
const attrNameToPropNameMap = create(null);

export function getPropNameFromAttrName(attrName: string): string {
    let propName = attrNameToPropNameMap[attrName];
    if (!propName) {
        propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}

const CAPS_REGEX = /[A-Z]/g;
import {
    HTMLPropertyNamesWithLowercasedReflectiveAttributes,
} from "./dom.js";

/**
 * This dictionary contains the mapping between property names
 * and the corresponding attribute name. This helps to trigger observable attributes.
 */
const propNameToAttributeNameMap = {
    // these are exceptions to the rule that cannot be inferred via `CAPS_REGEX`
    className: 'class',
    htmlFor: 'for',
};
// Few more exceptions where the attribute name matches the property in lowercase.
HTMLPropertyNamesWithLowercasedReflectiveAttributes.forEach((propName: string) => {
    propNameToAttributeNameMap[propName] = propName.toLowerCase();
});

export function getAttrNameFromPropName(propName: string): string {
    let attrName = propNameToAttributeNameMap[propName];
    if (!attrName) {
        attrName = propName.replace(CAPS_REGEX, (match: string): string => '-' + match.toLowerCase());
        propNameToAttributeNameMap[propName] = attrName;
    }
    return attrName;
}

export function toAttributeValue(raw: any): string | null {
    // normalizing attrs from compiler into HTML global attributes
    if (raw === true) {
        raw = '';
    } else if (raw === false) {
        raw = null;
    }
    return raw !== null ? raw + '' : null;
}

export function noop() {}

export function getMapFromClassName(className: string): HashTable<boolean> {
    const map = {};
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
    return map;
}
