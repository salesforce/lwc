import assert from "./assert";
import { create, seal, ArrayPush, isFunction, ArrayIndexOf, isUndefined, StringIndexOf, StringReplace, hasOwnProperty } from "./language";
import { ComponentConstructor } from "./component";
import {
    AttrNameToPropNameMap,
    PropNameToAttrNameMap,
} from "./dom";

export type Callback = () => void;

let nextTickCallbackQueue: Callback[] = [];
export const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);
export const ViewModelReflection = Symbol();

function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(nextTickCallbackQueue.length, `If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of ${nextTickCallbackQueue}.`);
    }
    const callbacks: Callback[] = nextTickCallbackQueue;
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

/**
 * This method maps between attribute names
 * and the corresponding property name.
 */
export function getPropNameFromAttrName(attrName: string): string {
    if (!hasOwnProperty.call(PropNameToAttrNameMap, )) {
        AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
    }
    return AttrNameToPropNameMap[attrName];
}

const CAPS_REGEX = /[A-Z]/g;

/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
export function getAttrNameFromPropName(propName: string): string {
    if (!hasOwnProperty.call(PropNameToAttrNameMap, propName)) {
        PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, (match: string): string => '-' + match.toLowerCase());
    }
    return PropNameToAttrNameMap[propName];
}

// According to the WC spec (https://dom.spec.whatwg.org/#dom-element-attachshadow), certain elements
// are not allowed to attached a shadow dom, and therefore, we need to prevent setting forceTagName to
// those, otherwise we will not be able to use shadowDOM when forceTagName is specified in the future.
export function assertValidForceTagName(Ctor: ComponentConstructor) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { forceTagName } = Ctor;
    if (isUndefined(forceTagName)) {
        return;
    }
    const invalidTags = [
        "article", "aside", "blockquote", "body", "div", "footer", "h1", "h2", "h3", "h4",
        "h5", "h6", "header", "main", "nav", "p", "section", "span"];
    if (ArrayIndexOf.call(invalidTags, forceTagName) !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. None of the following tag names can be used: ${invalidTags.join(", ")}.`);
    }
    if (StringIndexOf.call(forceTagName, '-') !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. It cannot have a dash (-) on it because that is reserved for existing custom elements.`);
    }
}

export const usesNativeSymbols = typeof Symbol() === 'symbol';
