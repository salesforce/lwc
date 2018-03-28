import assert from './assert';
import { ReactiveMembrane } from "observable-membrane";
import { unwrap } from './membrane';
import { observeMutation, notifyMutation } from "./watcher";

function format(value: any) {
    return value;
}

export const membrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export function dangerousObjectMutation(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`Dangerously Mutating Object ${obj}. This object was passed to you from a parent component, and should not be mutated here. This will be removed in the near future.`);
    }
    return membrane.getProxy(unwrap(obj));
}
