import assert from "./assert";
import { VM, getElementOwnerVM, isNodeOwnedByVM, OwnerKey } from "./vm";
import {
    querySelectorAll as nativeQuerySelectorAll,
    parentNodeGetter as nativeParentNodeGetter,
    parentElementGetter as nativeParentElementGetter,
    iFrameContentWindowGetter,
} from "./dom";
import { Root, wrapIframeWindow } from "./root";
import {
    ArrayFilter,
    isUndefined,
    defineProperty,
    defineProperties,
    hasOwnProperty,
} from "./language";
import { isBeingConstructed } from "./invoker";

function getShadowParent(node: HTMLElement, vm: VM, value: undefined | HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    if (!isUndefined(vm) && value === vm.elm) {
        // walking up via parent chain might end up in the shadow root element
        return vm.cmpRoot!;
    } else if (value instanceof Element && node[OwnerKey] === value[OwnerKey]) {
        // cutting out access to something outside of the shadow of the current target (usually slots)
        return patchShadowDomTraversalMethods(value);
    }
    return null;
}

export function parentNodeDescriptorValue(this: HTMLElement): HTMLElement | Root | null {
    const vm = getElementOwnerVM(this) as VM;
    const value = nativeParentNodeGetter.call(this);
    return getShadowParent(this, vm, value);
}

export function parentElementDescriptorValue(this: HTMLElement): HTMLElement | Root | null {
    const vm = getElementOwnerVM(this) as VM;
    const value = nativeParentElementGetter.call(this);
    return getShadowParent(this, vm, value);
}

export function lightDomQuerySelectorAll(this: HTMLElement, selectors: string) {
    const vm = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selectors);
    return ArrayFilter.call(matches, (match) => isNodeOwnedByVM(vm, patchShadowDomTraversalMethods(match)));
}

export function lightDomQuerySelector(this: HTMLElement, selectors: string) {
    const vm = getElementOwnerVM(this) as VM;
    const nodeList = nativeQuerySelectorAll.call(this, selectors);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i]);
        }
    }
    return null;
}

function getFirstMatch(vm: VM, elm: Element, selector: string): Element | null {
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i]);
        }
    }
    return null;
}

function getAllMatches(vm: VM, elm: Element, selector: string): HTMLElement[] {
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node: HTMLElement): boolean => isNodeOwnedByVM(vm, node));
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

const shadowDescriptors: PropertyDescriptorMap = {
    querySelector: {
        value: lightDomQuerySelector,
        configurable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAll,
        configurable: true,
    },
    parentNode: {
        get: parentNodeDescriptorValue,
        configurable: true,
    },
    parentElement: {
        get: parentElementDescriptorValue,
        configurable: true,
    }
};

const contentWindowDescriptor: PropertyDescriptor = {
    get(this: HTMLIFrameElement) {
        const original = iFrameContentWindowGetter.call(this);
        if (original) {
            return wrapIframeWindow(original);
        }
        return original;
    },
    configurable: true,
};

export function patchShadowDomTraversalMethods(node: HTMLElement): HTMLElement {
    if (!hasOwnProperty.call(node, 'querySelector')) {
        defineProperties(node, shadowDescriptors);
    }

    if (node.tagName === 'IFRAME' && !hasOwnProperty.call(node, 'contentWindow')) {
        defineProperty(node, 'contentWindow', contentWindowDescriptor);
    }
    return node;
}
