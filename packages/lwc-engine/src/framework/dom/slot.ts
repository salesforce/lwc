import {
    parentNodeGetter as nativeParentNodeGetter,
} from "./node";

import {
    getElementOwnerVM,
} from "../vm";

export function assignedSlotGetter(this: HTMLElement) {
    const parentNode = nativeParentNodeGetter.call(this);
    if (parentNode.tagName !== 'SLOT' || getElementOwnerVM(parentNode) === getElementOwnerVM(this)) {
        return null;
    }
    return parentNode;
}
