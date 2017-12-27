import { OwnerKey } from "../vm";
import { VNode, Module } from "../../3rdparty/snabbdom/types";

function updateUID(oldVnode: VNode, vnode: VNode) {
    const { data: { uid: oldUid } } = oldVnode;
    const { data: { uid } } = vnode;
    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    (vnode.elm as Element)[OwnerKey] = uid;
}

// TODO: we might not need to do this in update, only in create!
const uidModule: Module = {
    create: updateUID,
    update: updateUID,
};
export default uidModule;
