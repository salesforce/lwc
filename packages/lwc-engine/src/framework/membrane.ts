import assert from "../shared/assert";
import { toString } from "../shared/language";
import ObservableMembrane from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";
import { getRawNode } from "../faux-shadow/faux";

function valueDistortion(value: any) {
    if (process.env.NODE_ENV !== 'production') {
        // For now, if we determine that value is a traverse membrane we want to
        // throw a big error.
        if (getRawNode(value) !== value) {
            throw new ReferenceError(`Invalid attempt to get access to a traverse membrane ${toString(value)} via a reactive membrane.`);
        }
    }
    return value;
}

// Super hacky workaround for the following ts compiler error:
// error TS2351: Cannot use 'new' with an expression whose type lacks a call or construct signature.
let _ObservableMembrane = ObservableMembrane;
_ObservableMembrane = require("observable-membrane"); // tslint:disable-line
export const reactiveMembrane = new _ObservableMembrane({
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
     // observable membrane goes first because it is in the critical path
     let unwrapped = reactiveMembrane.unwrapProxy(value);
     if (unwrapped !== value) {
         return unwrapped;
     }
     // traverse membrane is not that important, it goes second
     unwrapped = getRawNode(value);
     if (unwrapped !== value) {
         return unwrapped;
     }
     return value;
};
