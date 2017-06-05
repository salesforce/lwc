import { OwnerKey } from "../vm";

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
