import assert from "./assert";
import { wasNodePassedIntoVM, VM, getElementOwnerVM, isNodeOwnedByVM, OwnerKey } from "./vm";
import {
    querySelectorAll as nativeQuerySelectorAll,
    parentNodeGetter as nativeParentNodeGetter,
    parentElementGetter as nativeParentElementGetter,
} from "./dom";
import { Root } from "./root";
import {
    ArrayFilter,
    isUndefined,
} from "./language";
import { isBeingConstructed } from "./invoker";

export function parentNodeDescriptorValue(this: HTMLElement): HTMLElement | Root | null {
    const vm = getElementOwnerVM(this);
    const value = nativeParentElementGetter.call(this);
    if (!isUndefined(vm) && value === vm.elm) {
        // walking up via parent chain might end up in the shadow root element
        return vm.cmpRoot!;
    } else if (value instanceof Element && this[OwnerKey] !== value[OwnerKey]) {
        // cutting out access to something outside of the shadow of the current target (usually slots)
        return null;
    }
    return value;
}

export function lightDomQuerySelectorAll(this: HTMLElement, selectors: string) {
    const ownerVM = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selectors);
    return ArrayFilter.call(matches, (match) => wasNodePassedIntoVM(ownerVM, match));
}

export function lightDomQuerySelector(this: HTMLElement, selectors: string) {
    const ownerVM = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selectors);
    const nodeList = ArrayFilter.call(matches, (match) => wasNodePassedIntoVM(ownerVM, match));
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(ownerVM, nodeList[i])) {
            return nodeList[i];
        }
    }
    return null;
}

function getFirstMatch(vm: VM, elm: Element, selector: string): Element | null {
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return nodeList[i];
        }
    }
    return null;
}

function getAllMatches(vm: VM, elm: Element, selector: string): HTMLElement[] {
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => isNodeOwnedByVM(vm, node));
    return filteredNodes;
}


export function shadowRootQuerySelector(vm: VM, selector: string): Element | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }

    return getFirstMatch(vm, vm.elm, selector);
}

export function shadowRootQuerySelectorAll(vm: VM, selector: string): HTMLElement[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    return getAllMatches(vm, vm.elm, selector);
}
