import assert from "../shared/assert";
import { toString } from "../shared/language";
import { ReactiveMembrane, unwrap as observableUnwrap } from "observable-membrane-internal";
import { observeMutation, notifyMutation } from "./watcher";
import { getRawNode } from "../faux-shadow/faux";

function format(value: any) {
    if (process.env.NODE_ENV !== 'production') {
        // For now, if we determine that value is a piercing membrane
        // we want to throw a big error.
        if (getRawNode(value) !== value) {
            throw new ReferenceError(`Invalid attempt to get access to a piercing membrane ${toString(value)} via a reactive membrane.`);
        }
    }
    return value;
}

export const reactiveMembrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
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
     // observable membrane goes first because it is in the critical path
     let unwrapped = observableUnwrap(value);
     if (unwrapped !== value) {
         return unwrapped;
     }
     // piercing membrane is not that important, it goes second
     unwrapped = getRawNode(value);
     if (unwrapped !== value) {
         return unwrapped;
     }
     return value;
};
