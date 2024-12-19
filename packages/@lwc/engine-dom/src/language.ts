/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Like @lwc/shared, but for DOM APIs

const ElementDescriptors = Object.getOwnPropertyDescriptors(Element.prototype);
/** Binds `fn.call` to `fn` so you don't need `.call`. */
const uncall = <Args extends unknown[], Ret>(
    fn: (this: Element, ...args: Args) => Ret
): ((element: Element, ...args: Args) => Ret) => {
    return (element, ...args) => fn.apply(element, args);
};

export const ElementAttachShadow = uncall(ElementDescriptors.attachShadow.value!);
export const ElementChildren = uncall(ElementDescriptors.children.get!);
export const ElementClassList = uncall(ElementDescriptors.classList.get!);
export const ElementFirstElementChild = uncall(ElementDescriptors.firstElementChild.get!);
export const ElementGetAttribute = uncall(ElementDescriptors.getAttribute.value!);
export const ElementGetAttributeNS = uncall(ElementDescriptors.getAttributeNS.value!);
export const ElementGetBoundingClientRect = uncall(ElementDescriptors.getBoundingClientRect.value!);
export const ElementGetElementsByClassName = uncall(
    ElementDescriptors.getElementsByClassName.value!
);
export const ElementGetElementsByTagName = uncall(ElementDescriptors.getElementsByTagName.value!);
export const ElementHasAttribute = uncall(ElementDescriptors.hasAttribute.value!);
export const ElementHasAttributeNS = uncall(ElementDescriptors.hasAttributeNS.value!);
export const ElementId = uncall(ElementDescriptors.id.get!);
export const ElementLastElementChild = uncall(ElementDescriptors.lastElementChild.get!);
export const ElementQuerySelector = uncall(ElementDescriptors.querySelector.value!);
export const ElementQuerySelectorAll = uncall(ElementDescriptors.querySelectorAll.value!);
export const ElementRemoveAttribute = uncall(ElementDescriptors.removeAttribute.value!);
export const ElementRemoveAttributeNS = uncall(ElementDescriptors.removeAttributeNS.value!);
export const ElementSetAttribute = uncall(ElementDescriptors.setAttribute.value!);
export const ElementSetAttributeNS = uncall(ElementDescriptors.setAttributeNS.value!);
export const ElementShadowRoot = uncall(ElementDescriptors.shadowRoot.get!);
export const ElementTagName = uncall(ElementDescriptors.tagName.get!);

// Present in `HTMLElementTheGoodParts`, but from a superclass of `Element`
// addEventListener
// childNodes
// dispatchEvent
// firstChild
// isConnected
// lastChild
// ownerDocument
// removeEventListener
