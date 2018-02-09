import { ReactiveMembrane, unwrap } from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

function format(value: any) {
    return value;
}

const membrane = new ReactiveMembrane(format, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});


export { membrane, unwrap }