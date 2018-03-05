import assert from './assert';
import { ReactiveMembrane, unwrap as observableUnwrap } from "observable-membrane";
import { unwrap as membraneUnwrap } from './membrane';
import { observeMutation, notifyMutation } from "./watcher";

function format(value: any) {
    return value;
}

export const membrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});

const unwrapMethods = [
    membraneUnwrap,
    observableUnwrap
];

const { length: unwrapLength } = unwrapMethods;

export function unwrap(value: any): any {
    for (let i = 0; i < unwrapLength; i += 1) {
        const current = unwrapMethods[i];
        const unwrapped = current(value);
        if (unwrapped !== value) {
            return unwrapped;
        }
    }
    return value;
}

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export function dangerousObjectMutation(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`Dangerously Mutating Object ${obj}. This object was passed to you from a parent component, and should not be mutated here. This will be removed in the near future.`);
    }
    return membrane.getProxy(unwrap(obj));
}
