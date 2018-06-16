import assert from "../assert";
import { VM, getNodeOwnerVM, isNodeOwnedByVM, OwnerKey, getCustomElementVM } from "../vm";
import {
    parentNodeGetter as nativeParentNodeGetter,
    parentElementGetter as nativeParentElementGetter,
    childNodesGetter as nativeChildNodesGetter,
    textContextSetter,
} from "./node";
import {
    querySelectorAll as nativeQuerySelectorAll, innerHTMLSetter,
} from "./element";
import { wrapIframeWindow } from "./iframe";
import {
    defineProperty,
    ArrayReduce,
    ArraySlice,
    isFalse,
    ArrayPush,
    assign,
    hasOwnProperty,
} from "../language";
import { isBeingConstructed } from "../invoker";
import { getOwnPropertyDescriptor, isNull } from "../language";
import { wrap as traverseMembraneWrap, contains as traverseMembraneContains } from "./traverse-membrane";
import { getOuterHTML } from "../../3rdparty/polymer/outer-html";
import { getTextContent } from "../../3rdparty/polymer/text-content";
import { getInnerHTML } from "../../3rdparty/polymer/inner-html";
import { ViewModelReflection } from "../utils";

export function getPatchedCustomElement(element: HTMLElement): HTMLElement {
    return traverseMembraneWrap(element);
}

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

function parentNodeDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const vm = getNodeOwnerVM(this) as VM;
    const value = nativeParentNodeGetter.call(this);
    return getShadowParent(this, vm, value);
}

function parentElementDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const vm = getNodeOwnerVM(this) as VM;
    const value = nativeParentElementGetter.call(this);
    return getShadowParent(this, vm, value);
}

export function shadowRootChildNodes(vm: VM, elm: Element) {
    return getAllMatches(vm, nativeChildNodesGetter.call(elm));
}

function getAllMatches(vm: VM, nodeList: NodeList): Element[] {
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

function getFirstMatch(vm: VM, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i] as Element);
        }
    }
    return null;
}

function lightDomQuerySelectorAllValue(this: HTMLElement, selector: string): Element[] {
    const vm = getNodeOwnerVM(this) as VM;
    const matches = nativeQuerySelectorAll.call(this, selector);
    return getAllMatches(vm, matches);
}

function lightDomQuerySelectorValue(this: HTMLElement, selector: string): Element | null {
    const vm = getNodeOwnerVM(this) as VM;
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

export function shadowRootQuerySelectorAll(vm: VM, selector: string): Element[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isBeingConstructed(vm), `this.template.querySelectorAll() cannot be called during the construction of the custom element for ${vm} because no content has been rendered yet.`);
    }
    const nodeList = nativeQuerySelectorAll.call(vm.elm, selector);
    return getAllMatches(vm, nodeList);
}

function lightDomChildNodesGetter(this: HTMLElement): Node[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`childNodes on ${this} returns a live NodeList which is not stable. Use querySelectorAll instead.`);
    }
    const ownerVM = getNodeOwnerVM(this) as VM;
    let children;
    if (hasOwnProperty.call(this, ViewModelReflection)) {
        const customElementVM = getCustomElementVM(this);
        // lwc element, in which case we need to get only the nodes
        // that were slotted
        const slots = nativeQuerySelectorAll.call(customElementVM.elm, 'slot');
        children = ArrayReduce.call(slots, (seed, slot) => {
            if (isNodeOwnedByVM(customElementVM, slot)) {
                ArrayPush.apply(seed, ArraySlice.call(nativeChildNodesGetter.call(slot)));
            }
            return seed;
        }, []);
    } else {
        // regular element
        children = nativeChildNodesGetter.call(this);
    }
    return getAllMatches(ownerVM, children);
}

function lightDomInnerHTMLGetter(this: Element): string {
    return getInnerHTML(patchShadowDomTraversalMethods(this));
}

function lightDomOuterHTMLGetter(this: Element): string {
    return getOuterHTML(patchShadowDomTraversalMethods(this));
}

function lightDomTextContentGetter(this: Node): string {
    return getTextContent(patchShadowDomTraversalMethods(this));
}

function assignedSlotGetter(this: Node): HTMLElement | null {
    const parentNode: HTMLElement = nativeParentNodeGetter.call(this);
    if (isNull(parentNode) || parentNode.tagName !== 'SLOT' || getNodeOwnerVM(parentNode) === getNodeOwnerVM(this)) {
        return null;
    }
    return patchShadowDomTraversalMethods(parentNode as HTMLElement);
}

export const NodePatchDescriptors: PropertyDescriptorMap = {
    childNodes: {
        get: lightDomChildNodesGetter,
        configurable: true,
        enumerable: true,
    },
    assignedSlot: {
        get: assignedSlotGetter,
        configurable: true,
        enumerable: true,
    },
    textContent: {
        get: lightDomTextContentGetter,
        set: textContextSetter,
        configurable: true,
        enumerable: true,
    },
    parentNode: {
        get: parentNodeDescriptorValue,
        configurable: true,
    },
    parentElement: {
        get: parentElementDescriptorValue,
        configurable: true,
    },
};

export const ElementPatchDescriptors: PropertyDescriptorMap = assign(NodePatchDescriptors, {
    querySelector: {
        value: lightDomQuerySelectorValue,
        configurable: true,
        enumerable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAllValue,
        configurable: true,
        enumerable: true,
    },
    innerHTML: {
        get: lightDomInnerHTMLGetter,
        set: innerHTMLSetter,
        configurable: true,
        enumerable: true,
    },
    outerHTML: {
        get: lightDomOuterHTMLGetter,
        configurable: true,
        enumerable: true,
    },
});

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

function nodeIsPatched(node: Node): boolean {
    // TODO: Remove comment once membrane is gone
    // return isFalse(hasOwnProperty.call(node, 'querySelector'));
    return traverseMembraneContains(node);
}

function patchDomNode<T extends Node>(node: T): T {
    return traverseMembraneWrap(node);
}

// For the time being, we have to use a proxy to get Shadow Semantics.
// The other possibility is to monkey patch the element itself, but this
// is very difficult to integrate because almost no integration tests
// understand what to do with shadow root. Using a Proxy here allows us
// to enforce shadow semantics from within components and still allows browser
// to use "light" apis as expected.
export function patchShadowDomTraversalMethods<T extends Node>(node: T): T {
    // Patching is done at the HTMLElement instance level.
    // Avoid monkey patching shadow methods twice for perf reasons.
    // If the node has querySelector defined on it, we have already
    // seen it and can move on.
    if (isFalse(nodeIsPatched(node as Node))) {
        if ((node as any).tagName === 'IFRAME') {
            // We need to patch iframe.contentWindow because raw access to the contentWindow
            // Will break in compat mode
            defineProperty(node, 'contentWindow', contentWindowDescriptor);
        }
    }
    return patchDomNode(node);
}
