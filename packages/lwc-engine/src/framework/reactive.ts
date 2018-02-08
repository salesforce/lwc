import { ReactiveMembrane } from "reactive-membrane";
import { observeMutation, notifyMutation } from "./watcher";

export const membrane = new ReactiveMembrane((value: any) => value, {
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});