import { ReactiveMembrane } from "observable-membrane";
import { observeMutation, notifyMutation } from "./watcher";

export const membrane = new ReactiveMembrane((value: any) => value, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});