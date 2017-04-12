import {
    addComponentSlot,
    removeComponentSlot,
} from "../component.js";
import { isUndefined } from "../language.js";
import { EmptyObject } from "../utils.js";

function update(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }

    let { data: { slotset: oldSlots } } = oldVnode;
    let { data: { slotset: newSlots } } = vnode;

    // infuse key-value pairs from slotset into the component
    if (oldSlots !== newSlots && (oldSlots || newSlots)) {
        let key: string, cur: any;
        oldSlots = oldSlots || EmptyObject;
        newSlots = newSlots || EmptyObject;
        // removed slots should be removed from component's slotset
        for (key in oldSlots) {
            if (!(key in newSlots)) {
                removeComponentSlot(vm, key);
            }
        }

        // new or different slots should be set in component's slotset
        for (key in newSlots) {
            cur = newSlots[key];
            if (!(key in oldSlots) || oldSlots[key] != cur) {
                if (cur && cur.length) {
                    addComponentSlot(vm, key, cur);
                } else {
                    removeComponentSlot(vm, key);
                }
            }
        }
    }
}

export default {
    create: update,
    update,
};
