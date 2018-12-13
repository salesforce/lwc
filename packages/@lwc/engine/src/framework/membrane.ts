import assert from "../shared/assert";
import { toString, isFunction } from "../shared/language";
import ObservableMembrane from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

/**
 * Distortion could allow only very specific functions, instead of the wild west
 * to attempt to fulfill the security requirements. (E.g.: passing arguments down):
 *
 * var x = {};
 * this.x.hasOwnProperty('diego');
 *
 * var y = [1,2,3];
 * this.y.forEach(() => {});
 *
 * var z = {  forEach: () => {} };
 * this.z.forEach; // throw
 *
 */

function valueDistortion(value: any /*, obj: any, key: PropertyKey */) {
    // options 1: prevent accessing functions that are not from Arrays or Objects
    if (isFunction(value)) {
        // if (!isArray(obj) || !Array.prototype[key] === value) {
        //     return value;
        // } else if (isObject(obj) && Object.prototype[key] === value) {
        //     return value;
        // } else {
        //     throw new TypeError(`Invalid Access`);
        // }
        return value; // noop to match the existing semantics, eventually we should throw
    }
    // option 2: hook for locker to do it
    return value;
}

export const reactiveMembrane = new ObservableMembrane({
    valueObserved: observeMutation,
    valueMutated: notifyMutation,
    valueDistortion,
});

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export function dangerousObjectMutation(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`Dangerously Mutating Object ${toString(obj)}. This object was passed to you from a parent component, and should not be mutated here. This will be removed in the near future.`);
    }
    return reactiveMembrane.getProxy(unwrap(obj));
}

// Universal unwrap mechanism that works for observable membrane
// and wrapped iframe contentWindow
export const unwrap = function(value: any): any {
     const unwrapped = reactiveMembrane.unwrapProxy(value);
     if (unwrapped !== value) {
         return unwrapped;
     }
     return value;
};
