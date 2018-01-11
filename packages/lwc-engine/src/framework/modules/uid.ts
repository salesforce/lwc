import { OwnerKey } from "../vm";
import { defineProperty } from './../language';


function updateUID(oldVnode: VNode, vnode: VNode) {
    const { uid: oldUid } = oldVnode;
    const { elm, uid } = vnode;
    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    elm[OwnerKey] = uid;
}

const uidModule: Module = {
    create: updateUID,
    update: updateUID,
};
export default uidModule;
