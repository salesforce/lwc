/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import {
    attachShadow,
    getShadowRoot,
    SyntheticShadowRootInterface,
    isDelegatingFocus,
    getIE11FakeShadowRootPlaceholder,
    hasSyntheticShadow,
} from './shadow-root';
import { addCustomElementEventListener, removeCustomElementEventListener } from './events';
import {
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    isSlotElement,
    isNodeOwnedBy,
    getFirstMatch,
} from './traverse';
import { hasAttribute, tabIndexGetter, childrenGetter } from '../env/element';
import {
    isNull,
    isFalse,
    getPropertyDescriptor,
    ArrayFilter,
    ArrayUnshift,
    ArrayPush,
} from '../shared/language';
import { getActiveElement, handleFocusIn, handleFocus, ignoreFocusIn, ignoreFocus } from './focus';
import { createStaticNodeList } from '../shared/static-node-list';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import { hasNativeSymbolsSupport, isExternalChildNodeAccessorFlagOn } from './node';
import { getNodeKey, getNodeNearestOwnerKey, PatchedNode, getInternalChildNodes } from './node';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    parentElementGetter,
    childNodesGetter,
} from '../env/node';
import { querySelectorAll, innerHTMLSetter } from '../env/element';
import { getOuterHTML } from '../3rdparty/polymer/outer-html';
import '../polyfills/node-get-root-node/main';
import { HTMLElementConstructor } from './element';

export interface HTMLElementConstructor {
    prototype: HTMLElement;
    new (): HTMLElement;
}

// when finding a slot in the DOM, we can fold it if it is contained
// inside another slot.
function foldSlotElement(slot: HTMLElement) {
    let parent = parentElementGetter.call(slot);
    while (!isNull(parent) && isSlotElement(parent)) {
        slot = parent as HTMLElement;
        parent = parentElementGetter.call(slot);
    }
    return slot;
}

function isNodeSlotted(host: Element, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            host instanceof HTMLElement,
            `isNodeSlotted() should be called with a host as the first argument instead of ${host}`
        );
        assert.invariant(
            node instanceof Node,
            `isNodeSlotted() should be called with a node as the second argument instead of ${node}`
        );
        assert.isTrue(
            compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS,
            `isNodeSlotted() should never be called with a node that is not a child node of ${host}`
        );
    }
    const hostKey = getNodeKey(host);
    // this routine assumes that the node is coming from a different shadow (it is not owned by the host)
    // just in case the provided node is not an element
    let currentElement = node instanceof Element ? node : parentElementGetter.call(node);
    while (!isNull(currentElement) && currentElement !== host) {
        const elmOwnerKey = getNodeNearestOwnerKey(currentElement);
        const parent = parentElementGetter.call(currentElement);
        if (elmOwnerKey === hostKey) {
            // we have reached an element inside the host's template, and only if
            // that element is an slot, then the node is considered slotted
            // TODO: add the examples
            return isSlotElement(currentElement);
        } else if (parent === host) {
            return false;
        } else if (!isNull(parent) && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
            // we are crossing a boundary of some sort since the elm and its parent
            // have different owner key. for slotted elements, this is possible
            // if the parent happens to be a slot.
            if (isSlotElement(parent)) {
                /**
                 * the slot parent might be allocated inside another slot, think of:
                 * <x-root> (<--- root element)
                 *    <x-parent> (<--- own by x-root)
                 *       <x-child> (<--- own by x-root)
                 *           <slot> (<--- own by x-child)
                 *               <slot> (<--- own by x-parent)
                 *                  <div> (<--- own by x-root)
                 *
                 * while checking if x-parent has the div slotted, we need to traverse
                 * up, but when finding the first slot, we skip that one in favor of the
                 * most outer slot parent before jumping into its corresponding host.
                 */
                currentElement = getNodeOwner(foldSlotElement(parent as HTMLElement));
                if (!isNull(currentElement)) {
                    if (currentElement === host) {
                        // the slot element is a top level element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    } else if (getNodeNearestOwnerKey(currentElement) === hostKey) {
                        // the slot element is an element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    }
                }
            } else {
                return false;
            }
        } else {
            currentElement = parent;
        }
    }
    return false;
}

function getAllSlottedMatches(
    host: HTMLElement,
    nodeList: NodeList | Node[]
): Array<Node & Element> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}

function getFirstSlottedMatch(host: HTMLElement, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i] as Element;
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return node;
        }
    }
    return null;
}

function lightDomQuerySelectorAll(elm: Element, selectors: string): Element[] {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        return [];
    }
    const nodeList = querySelectorAll.call(elm, selectors);
    if (getNodeKey(elm)) {
        // it is a custom element, and we should then filter by slotted elements
        return getAllSlottedMatches(elm as HTMLElement, nodeList);
    } else {
        // regular element, we should then filter by ownership
        return getAllMatches(owner, nodeList);
    }
}

function lightDomQuerySelector(elm: Element, selector: string): Element | null {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        // the it is a root, and those can't have a lightdom
        return null;
    }
    const nodeList = querySelectorAll.call(elm, selector);
    if (getNodeKey(elm)) {
        // it is a custom element, and we should then filter by slotted elements
        return getFirstSlottedMatch(elm as HTMLElement, nodeList);
    } else {
        // regular element, we should then filter by ownership
        return getFirstMatch(owner, nodeList);
    }
}

export function PatchedElement(elm: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedNode(elm) as HTMLElementConstructor;
    const {
        addEventListener: superAddEventListener,
        removeEventListener: superRemoveEventListener,
        blur: superBlur,
    } = elm;

    // Note: Element.getElementsByTagName and Element.getElementsByClassName are purposefully
    // omitted from the list of patched methods. In order for the querySelector* APIs to run
    // properly in jsdom, we need to make sure those methods doesn't respect the shadow DOM
    // semantic.
    // https://github.com/salesforce/lwc/pull/1179#issuecomment-484041707
    return class PatchedHTMLElement extends Ctor {
        // Regular Elements
        querySelector(this: Element, selector: string): Element | null {
            return lightDomQuerySelector(this, selector);
        }
        querySelectorAll(this: Element, selectors: string): NodeListOf<Element> {
            return createStaticNodeList(lightDomQuerySelectorAll(this, selectors));
        }
        get innerHTML(this: Element): string {
            const childNodes = getInternalChildNodes(this);
            let innerHTML = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                innerHTML += getOuterHTML(childNodes[i]);
            }
            return innerHTML;
        }
        set innerHTML(this: Element, value: string) {
            innerHTMLSetter.call(this, value);
        }
        get outerHTML() {
            return getOuterHTML(this);
        }
        // TODO: implement set outerHTML

        // CE patches
        attachShadow(options: ShadowRootInit): SyntheticShadowRootInterface {
            return attachShadow(this, options) as SyntheticShadowRootInterface;
        }
        addEventListener(
            this: EventTarget,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            if (hasSyntheticShadow(this as HTMLElement)) {
                addCustomElementEventListener(this as HTMLElement, type, listener, options);
            } else {
                superAddEventListener.call(this as HTMLElement, type, listener, options);
            }
        }
        removeEventListener(
            this: EventTarget,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            if (hasSyntheticShadow(this as HTMLElement)) {
                removeCustomElementEventListener(this as HTMLElement, type, listener, options);
            } else {
                superRemoveEventListener.call(this as HTMLElement, type, listener, options);
            }
        }
        get shadowRoot(this: HTMLElement): SyntheticShadowRootInterface | null {
            if (hasSyntheticShadow(this)) {
                const shadow = getShadowRoot(this);
                if (shadow.mode === 'open') {
                    return shadow;
                }
            }
            return null;
        }
        get tabIndex(this: HTMLElement) {
            if (
                hasSyntheticShadow(this) &&
                isDelegatingFocus(this) &&
                isFalse(hasAttribute.call(this, 'tabindex'))
            ) {
                // this cover the case where the default tabindex should be 0 because the
                // custom element is delegating its focus
                return 0;
            }

            // NOTE: Technically this should be `super.tabIndex` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
            return descriptor!.get!.call(this);
        }
        set tabIndex(this: HTMLElement, value: any) {
            if (hasSyntheticShadow(this)) {
                // This tabIndex setter might be confusing unless it is understood that HTML elements
                // have default tabIndex property values. Natively focusable elements have a default
                // tabIndex value of 0 and all other elements have a default tabIndex value of -1. An
                // example of when this matters: We don't need to do anything for <x-foo> but we do need
                // to add a listener for <x-foo tabindex="-1">. The tabIndex property value is -1 in
                // both cases, so we need an additional check to see if the tabindex attribute is
                // reflected on the host.

                const delegatesFocus = isDelegatingFocus(this);

                // Record the state of things before invoking component setter.
                const prevValue = tabIndexGetter.call(this);
                const prevHasAttr = hasAttribute.call(this, 'tabindex');

                // NOTE: Technically this should be `super.tabIndex` however Typescript
                // has a known bug while transpiling down to ES5
                // https://github.com/Microsoft/TypeScript/issues/338
                const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
                descriptor!.set!.call(this, value);

                // Record the state of things after invoking component setter.
                const currValue = tabIndexGetter.call(this);
                const currHasAttr = hasAttribute.call(this, 'tabindex');

                const didValueChange = prevValue !== currValue;

                // If the tabindex attribute is initially rendered, we can assume that this setter has
                // previously executed and a listener has been added. We must remove that listener if
                // the tabIndex property value has changed or if the component no longer renders a
                // tabindex attribute.
                if (prevHasAttr && (didValueChange || isFalse(currHasAttr))) {
                    if (prevValue === -1) {
                        ignoreFocusIn(this);
                    }
                    if (prevValue === 0 && delegatesFocus) {
                        ignoreFocus(this);
                    }
                }

                // If a tabindex attribute was not rendered after invoking its setter, it means the
                // component is taking control. Do nothing.
                if (isFalse(currHasAttr)) {
                    return;
                }

                // If the tabindex attribute is initially rendered, we can assume that this setter has
                // previously executed and a listener has been added. If the tabindex attribute is still
                // rendered after invoking the setter AND the tabIndex property value has not changed,
                // we don't need to do any work.
                if (prevHasAttr && currHasAttr && isFalse(didValueChange)) {
                    return;
                }

                // At this point we know that a tabindex attribute was rendered after invoking the
                // setter and that either:
                // 1) This is the first time this setter is being invoked.
                // 2) This is not the first time this setter is being invoked and the value is changing.
                // We need to add the appropriate listeners in either case.
                if (currValue === -1) {
                    // Add the magic to skip the shadow tree
                    handleFocusIn(this);
                }
                if (currValue === 0 && delegatesFocus) {
                    // Add the magic to skip the host element
                    handleFocus(this);
                }
                return;
            }
            // NOTE: Technically this should be `super.tabIndex` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
            descriptor!.set!.call(this, value);
        }
        blur(this: HTMLElement) {
            if (hasSyntheticShadow(this) && isDelegatingFocus(this)) {
                const currentActiveElement = getActiveElement(this);
                if (!isNull(currentActiveElement)) {
                    // if there is an active element, blur it
                    (currentActiveElement as HTMLElement).blur();
                    return;
                }
            }
            // NOTE: Technically this should be `super.blur` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            return superBlur.call(this);
        }
        get childNodes(this: HTMLElement): NodeListOf<Node & Element> {
            if (hasSyntheticShadow(this)) {
                const owner = getNodeOwner(this);
                const childNodes = isNull(owner)
                    ? []
                    : getAllMatches(owner, getFilteredChildNodes(this));
                if (
                    process.env.NODE_ENV !== 'production' &&
                    isFalse(hasNativeSymbolsSupport) &&
                    isExternalChildNodeAccessorFlagOn()
                ) {
                    // inserting a comment node as the first childNode to trick the IE11
                    // DevTool to show the content of the shadowRoot, this should only happen
                    // in dev-mode and in IE11 (which we detect by looking at the symbol).
                    // Plus it should only be in place if we know it is an external invoker.
                    ArrayUnshift.call(childNodes, getIE11FakeShadowRootPlaceholder(this));
                }
                return createStaticNodeList(childNodes);
            }
            // nothing to do here since this does not have a synthetic shadow attached to it
            return childNodesGetter.call(this);
        }
        get children(this: HTMLElement): HTMLCollectionOf<Element> {
            if (hasSyntheticShadow(this)) {
                // We cannot patch `children` in test mode
                // because JSDOM uses children for its "native"
                // querySelector implementation. If we patch this,
                // HTMLElement.prototype.querySelector.call(element) will not
                // return any elements from shadow, which is not what we want
                if (process.env.NODE_ENV === 'test') {
                    return childrenGetter.call(this);
                }
                const owner = getNodeOwner(this);
                const childNodes = isNull(owner)
                    ? []
                    : getAllMatches(owner, getFilteredChildNodes(this));
                return createStaticHTMLCollection(
                    ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element)
                );
            }
            // nothing to do here since this does not have a synthetic shadow attached to it
            return childrenGetter.call(this);
        }
    };
}
