import assert from "./assert";
import { create, seal, ArrayPush, isFunction, ArrayIndexOf, isUndefined, StringIndexOf, hasOwnProperty } from "./language";
import { ComponentConstructor } from "./component";

type Callback = () => void;

let nextTickCallbackQueue: Callback[] = [];
export const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);
export const ViewModelReflection = createSymbol('ViewModel');
export const PatchedFlag = createSymbol('PatchedFlag');

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

interface CircularModuleDependency {
    <T>(): T;
    readonly __circular__?: any;
}

export function isCircularModuleDependency(value: any): value is CircularModuleDependency {
    return hasOwnProperty.call(value, '__circular__');
}

/**
 * When LWC is used in the context of an Aura application, the compiler produces AMD
 * modules, that doesn't resolve properly circular dependencies between modules. In order
 * to circumvent this issue, the module loader returns a factory with a symbol attached
 * to it.
 *
 * This method returns the resolved value if it received a factory as argument. Otherwise
 * it returns the original value.
 */
export function resolveCircularModuleDependency(fn: CircularModuleDependency): ComponentConstructor {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(fn), `If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue instead of ${nextTickCallbackQueue}.`);
    }
    return fn();
}

/**
 * In IE11, symbols that we plan to apply everywhere are expensive
 * due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported.
 */
export function createSymbol(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return typeof Symbol() === 'symbol' ? Symbol(key) : `$$lwc-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: improve this to use defineProperty(o, fieldName, { value }) or a weakmap
    o[fieldName] = value;
}

export function getInternalField(o: object, fieldName: symbol): any {
    return o[fieldName];
}
