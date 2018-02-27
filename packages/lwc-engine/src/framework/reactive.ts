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
