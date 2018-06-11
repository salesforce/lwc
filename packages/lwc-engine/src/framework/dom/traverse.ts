import assert from "../assert";
import { VM, getElementOwnerVM, isNodeOwnedByVM, OwnerKey, getCustomElementVM } from "../vm";
import {
    parentNodeGetter as nativeParentNodeGetter,
    parentElementGetter as nativeParentElementGetter,
    childNodesGetter as nativeChildNodesGetter,
} from "./node";
import {
    querySelectorAll as nativeQuerySelectorAll,
} from "./element";
import { wrapIframeWindow } from "./iframe";
import {
    ArrayFilter,
    defineProperty,
    defineProperties,
    hasOwnProperty,
    ArrayReduce,
    ArraySlice,
} from "../language";
import { isBeingConstructed } from "../invoker";

import { getOwnPropertyDescriptor, isNull } from "../language";

const iFrameContentWindowGetter = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')!.get!;

function getShadowParent(node: HTMLElement, vm: VM, value: undefined | HTMLElement): ShadowRoot | HTMLElement | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    if (value === vm.elm) {
        // walking up via parent chain might end up in the shadow root element
        return vm.cmpRoot!;
    } else if (value instanceof Element && node[OwnerKey] === value[OwnerKey]) {
        // cutting out access to something outside of the shadow of the current target (usually slots)
        return patchShadowDomTraversalMethods(value);
    }
    return null;
}

export function parentNodeDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const vm = getElementOwnerVM(this) as VM;
    const value = nativeParentNodeGetter.call(this);
    return getShadowParent(this, vm, value);
}

export function parentElementDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const vm = getElementOwnerVM(this) as VM;
    const value = nativeParentElementGetter.call(this);
    return getShadowParent(this, vm, value);
}

export function shadowRootChildNodes(vm: VM, elm: Element) {
    return getAllMatches(vm, nativeChildNodesGetter.call(elm));
}

function getAllMatches(vm: VM, nodeList: NodeList): HTMLElement[] {
    return ArrayFilter.call(nodeList, (match) => {
        const isOwned = isNodeOwnedByVM(vm, match);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            patchShadowDomTraversalMethods(match);
        }
        return isOwned;
    });
}

function getFirstMatch(vm: VM, nodeList: NodeList): HTMLElement | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i]as HTMLElement);
        }
    }
    return null;
}

export function lightDomQuerySelectorAll(this: HTMLElement, selector: string): HTMLElement[] {
    const vm = getElementOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selector);
    return getAllMatches(vm, matches);
}

export function lightDomQuerySelector(this: HTMLElement, selector: string): HTMLElement | null {
    const vm = getElementOwnerVM(this) as VM;
    const nodeList = nativeQuerySelectorAll.call(this, selector);
    return getFirstMatch(vm, nodeList);
}

export function shadowRootQuerySelector(vm: VM, selector: string): Element | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.template.querySelector() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    const nodeList = nativeQuerySelectorAll.call(vm.elm, selector);
    return getFirstMatch(vm, nodeList);
}

export function shadowRootQuerySelectorAll(vm: VM, selector: string): HTMLElement[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    const nodeList = nativeQuerySelectorAll.call(vm.elm, selector);
    return getAllMatches(vm, nodeList);
}

export function lightDomCustomElementChildNodes(this: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`childNodes on ${this} returns a live nodelist which is not stable. Use querySelectorAll instead.`);
    }
    const ownerVM = getElementOwnerVM(this) as VM;
    const customElementVM = getCustomElementVM(this);
    const slots = shadowRootQuerySelectorAll(customElementVM, 'slot');
    const children = ArrayReduce.call(slots, (seed, slot) => {
        return seed.concat(ArraySlice.call(nativeChildNodesGetter.call(slot)));
    }, []);

    return getAllMatches(ownerVM, children);
}

export function lightDomChildNodes(this: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`childNodes on ${this} returns a live nodelist which is not stable. Use querySelectorAll instead.`);
    }
    const ownerVM = getElementOwnerVM(this) as VM;
    const children = nativeChildNodesGetter.call(this);
    return getAllMatches(ownerVM, children);
}

export function assignedSlotGetter(this: HTMLElement) {
    const parentNode = nativeParentNodeGetter.call(this);
    if (isNull(parentNode) || parentNode.tagName !== 'SLOT' || getElementOwnerVM(parentNode) === getElementOwnerVM(this)) {
        return null;
    }
    return parentNode;
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
    // TODO: @dval removes as a temporal fix for selenium internals
    // parentNode: {
    //     get: parentNodeDescriptorValue,
    //     configurable: true,
    // },
    parentElement: {
        get: parentElementDescriptorValue,
        configurable: true,
    },
    childNodes: {
        get: lightDomChildNodes,
        configurable: true,
    },
    assignedSlot: {
        get: assignedSlotGetter,
        configurable: true,
    },
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
    // Patching is done at the HTMLElement instance level.
    // Avoid monkey patching shadow methods twice for perf reasons.
    // If the node has querySelector defined on it, we have already
    // seen it and can move on.
    if (!hasOwnProperty.call(node, 'querySelector')) {
        defineProperties(node, shadowDescriptors);

        if (node.tagName === 'IFRAME') {
            // We need to patch iframe.contentWindow because raw access to the contentWindow
            // Will break in compat mode
            defineProperty(node, 'contentWindow', contentWindowDescriptor);
        }
    }
    return node;
}
