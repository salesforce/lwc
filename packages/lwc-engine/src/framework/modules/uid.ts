import { OwnerKey } from "../vm";
import { defineProperty } from './../language';


function updateUID(oldVnode: VNode, vnode: VNode) {
    const { uid: oldUid } = oldVnode;
    const { elm, uid } = vnode;
    if (uid === oldUid) {
        return;
    }
    // @ts-ignore
    defineProperty(elm, OwnerKey, {
        value: uid,
        enumerable: false,
        writable: true,
        configurable: true,
    });
}

const uidModule: Module = {
    create: updateUID,
    update: updateUID,
};
export default uidModule;
