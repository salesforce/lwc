import {
    updateComponentSlots,
} from "../component.js";

function update(oldvnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }
    const { data: { slotset: oldSlotset } } = oldvnode;
    const { data: { slotset } } = vnode;
    if (!oldSlotset && !slotset) {
        return;
    }
    if (oldSlotset === slotset) {
        return;
    }
    updateComponentSlots(vm, slotset);
}

export default {
    create: update,
    update,
};
