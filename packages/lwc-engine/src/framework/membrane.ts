import assert from "./assert";
import { toString, isUndefined } from "./language";
import { ReactiveMembrane, unwrap as observableUnwrap } from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

function format(value: any) {
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

export const TargetSlot = Symbol();

// Universal unwrap mechanism that works for observable membrane
// and wrapped iframe contentWindow
export function unwrap(value: any): any {
    // observable membrane goes first because it is in the critical path
    let unwrapped = observableUnwrap(value);
    if (unwrapped !== value) {
        return unwrapped;
    }
    // Wrapped iframe contentWindow
    unwrapped = value[TargetSlot];
    if (!isUndefined(unwrapped) && unwrapped !== value) {
        return unwrapped;
    }
    return value;
}
