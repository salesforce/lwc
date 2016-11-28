// @flow

///<reference path="types.d.ts"/>

import { ObjectElementToVMMap } from "./createElement.js"; 

export function mountToDom(element: RaptorElement, domNode: HTMLElement) {
    if (typeof element !== 'object' || !ObjectElementToVMMap.has(element)) {
        throw new Error(`Invalid raptor element ${element}. Raptor.mountToDom() can only be called with a raptor element created via Raptor.createElement().`);
    }
    const { elm } = ObjectElementToVMMap.get(element);
    domNode.innerHTML = '';
    domNode.appendChild(elm);
}
