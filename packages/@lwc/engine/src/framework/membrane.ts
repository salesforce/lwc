import assert from "../shared/assert";
import { toString } from "../shared/language";
import ObservableMembrane from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

function valueDistortion(value: any) {
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
