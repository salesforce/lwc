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
    defineProperty,
    ArrayReduce,
    ArraySlice,
    isFalse,
    ArrayPush,
} from "../language";
import { isBeingConstructed } from "../invoker";

import { getOwnPropertyDescriptor, isNull } from "../language";
import { wrap as traverseMembraneWrap, contains as traverseMembraneContains } from "./traverse-membrane";

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
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedByVM(vm, node);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node as HTMLElement));
        }
    }
    return filteredAndPatched;
}

function getFirstMatch(vm: VM, nodeList: NodeList): HTMLElement | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i] as HTMLElement);
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
    return patchShadowDomTraversalMethods(parentNode);
}

export const shadowDescriptors: PropertyDescriptorMap = {
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

function nodeIsPatched(node: Node) {
    // TODO: Remove comment once membrane is gone
    // return isFalse(hasOwnProperty.call(node, 'querySelector'));
    return traverseMembraneContains(node);
}

function patchDomNode(node): HTMLElement {
    return traverseMembraneWrap(node);
}

// For the time being, we have to use a proxy to get Shadow Semantics.
// The other possibility is to monkey patch the element itself, but this
// is very difficult to integrate because almost no integration tests
// understand what to do with shadow root. Using a Proxy here allows us
// to enforce shadow semantics from within components and still allows browser
// to use "light" apis as expected.
export function patchShadowDomTraversalMethods(node: HTMLElement): HTMLElement {
    // Patching is done at the HTMLElement instance level.
    // Avoid monkey patching shadow methods twice for perf reasons.
    // If the node has querySelector defined on it, we have already
    // seen it and can move on.
    if (isFalse(nodeIsPatched(node))) {
        if (node.tagName === 'IFRAME') {
            // We need to patch iframe.contentWindow because raw access to the contentWindow
            // Will break in compat mode
            defineProperty(node, 'contentWindow', contentWindowDescriptor);
        }
    }
    return patchDomNode(node);
}
