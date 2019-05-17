/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, forEach, defineProperty, isTrue } from '../shared/language';
import { getNodeOwnerKey, setNodeOwnerKey, getInternalChildNodes } from './node';
import '../polyfills/mutation-observer/main';

const MutationObserver = (window as any).MutationObserver;
const MutationObserverObserve = MutationObserver.prototype.observe;
const DomManualPrivateKey = '$$DomManualKey$$';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let portalObserver: MutationObserver | undefined;

const portalObserverConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
};

function patchPortalElement(node: Node, ownerKey: number, shadowToken: string | undefined) {
    // If node already has an ownerKey, we can skip
    // Note: checking if a node has any ownerKey is not enough
    // because this element could be moved from one
    // shadow to another
    if (getNodeOwnerKey(node) === ownerKey) {
        return;
    }
    setNodeOwnerKey(node, ownerKey);
    if (node instanceof Element) {
        (node as any).$shadowToken$ = shadowToken;
        const childNodes = getInternalChildNodes(node);
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            const child = childNodes[i];
            patchPortalElement(child, ownerKey, shadowToken);
        }
    }
}

function initPortalObserver() {
    return new MutationObserver(mutations => {
        forEach.call(mutations, mutation => {
            const { target: elm, addedNodes } = mutation;
            const ownerKey = getNodeOwnerKey(elm);
            const shadowToken = elm.$shadowToken$;

            // OwnerKey might be undefined at this point.
            // We used to throw an error here, but we need to return early instead.
            //
            // This routine results in a mutation target that will have no key
            // because its been removed by the time the observer runs

            // const div = document.createElement('div');
            // div.innerHTML = '<span>span</span>';
            // const span = div.querySelector('span');
            // manualElement.appendChild(div);
            // span.textContent = '';
            // span.parentNode.removeChild(span);
            if (isUndefined(ownerKey)) {
                return;
            }
            for (let i = 0, len = addedNodes.length; i < len; i += 1) {
                const node: Node = addedNodes[i];
                patchPortalElement(node, ownerKey, shadowToken);
            }
        });
    });
}

function markElementAsPortal(elm: Element) {
    if (isUndefined(portalObserver)) {
        portalObserver = initPortalObserver();
    }
    // install mutation observer for portals
    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig);
}

/**
 * Patching Element.prototype.$domManual$ to make elements a portal:
 *
 *  - we use a property to allow engines to signal that a particular element in
 *    a shadow supports manual insertion of child nodes.
 *
 *  - this signal comes as a boolean value, and we use it to install the MO instance
 *    onto the element, to propagation the $ownerKey$ and $shadowToken$ to all new
 *    child nodes.
 *
 *  - at the moment, there is no way to undo this operation, once the element is
 *    marked as $domManual$, setting it to false does nothing.
 *
 **/
defineProperty(Element.prototype, '$domManual$', {
    set(this: Element, v: boolean) {
        this[DomManualPrivateKey] = v;
        if (isTrue(v)) {
            markElementAsPortal(this);
        }
    },
    get() {
        return this[DomManualPrivateKey];
    },
});
