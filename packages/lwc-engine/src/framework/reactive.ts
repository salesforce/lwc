import { ReactiveMembrane } from "locker-membrane";
import { observeMutation, notifyMutation } from "./watcher";

export const membrane = new ReactiveMembrane({
    propertyMemberChange: notifyMutation,
    propertyMemberAccess: observeMutation,
});