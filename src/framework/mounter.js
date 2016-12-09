//<reference path="types.d.ts"/>

import { getDOMElement } from "./createElement.js";

export function mountToDom(raptorElement: RaptorElement, domNode: HTMLElement) {
    const element = getDOMElement(raptorElement);
    if (!element) {
        throw new Error(`Invalid raptor element ${raptorElement}. Raptor.mountToDom() can only be called with a raptor element created via Raptor.createElement().`);
    }
    domNode.innerHTML = '';
    domNode.appendChild(element);
}
