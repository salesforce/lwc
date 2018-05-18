import assert from "./assert";
import { wasNodePassedIntoVM, VM, getElementOwnerVM, getCustomElementVM, isNodeOwnedByVM } from "./vm";
import {
    querySelectorAll,
} from "./dom";
import {
    ArrayFilter,
} from "./language";
import { isBeingConstructed } from "./invoker";

export function lightDomQuerySelectorAll(this: HTMLElement, selectors: string) {
    const nodeList = querySelectorAll.call(this, selectors);
    const vm = getCustomElementVM(this)!;
    // TODO: locker service might need to do something here
    const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => wasNodePassedIntoVM(vm, node));

    if (process.env.NODE_ENV !== 'production') {
        if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(vm, selectors).length) {
            assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.template.querySelectorAll() instead.`);
        }
    }
    return filteredNodes;
}

export function lightDomQuerySelector(this: HTMLElement, selectors: string) {
    const vm = getCustomElementVM(this);
    const nodeList = querySelectorAll.call(this, selectors);
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (wasNodePassedIntoVM(vm, nodeList[i])) {
            // TODO: locker service might need to return a membrane proxy
            return nodeList[i];
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        if (shadowRootQuerySelector(vm, selectors)) {
            assert.logWarning(`this.querySelector() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.template.querySelector() instead.`);
        }
    }

    return null;
}

function getFirstMatch(vm: VM, elm: Element, selector: string): Element | null {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return nodeList[i];
        }
    }
    return null;
}

function getAllMatches(vm: VM, elm: Element, selector: string): HTMLElement[] {
    const nodeList = querySelectorAll.call(elm, selector);
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
