/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, forEach, defineProperty, isTrue } from '../shared/language';
import { childNodesGetter } from '../env/node';
import { MutationObserver, MutationObserverObserve } from '../env/mutation-observer';
import {
    setShadowRootResolver,
    ShadowRootResolver,
    getShadowRootResolver,
    isHostElement,
} from './shadow-root';
import { setShadowToken, getShadowToken } from './shadow-token';

const DomManualPrivateKey = '$$DomManualKey$$';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let portalObserver: MutationObserver | undefined;

const portalObserverConfig: MutationObserverInit = {
    childList: true,
};

function adoptChildNode(node: Node, fn: ShadowRootResolver, shadowToken: string | undefined) {
    const previousNodeShadowResolver = getShadowRootResolver(node);
    if (previousNodeShadowResolver === fn) {
        return; // nothing to do here, it is already correctly patched
    }
    setShadowRootResolver(node, fn);
    if (node instanceof Element) {
        setShadowToken(node, shadowToken);

        if (isHostElement(node)) {
            // Root LWC elements can't get content slotted into them, therefore we don't observe their children.
            return;
        }

        if (isUndefined(previousNodeShadowResolver)) {
            // we only care about Element without shadowResolver (no MO.observe has been called)
            MutationObserverObserve.call(portalObserver, node, portalObserverConfig);
        }
        // recursively patching all children as well
        const childNodes = childNodesGetter.call(node);
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            adoptChildNode(childNodes[i], fn, shadowToken);
        }
    }
}

function initPortalObserver() {
    return new MutationObserver(mutations => {
        forEach.call(mutations, mutation => {
            const { target: elm, addedNodes } = mutation;
            // the target of the mutation should always have a ShadowRootResolver attached to it
            const fn = getShadowRootResolver(elm) as ShadowRootResolver;
            const shadowToken = getShadowToken(elm);
            for (let i = 0, len = addedNodes.length; i < len; i += 1) {
                const node: Node = addedNodes[i];
                adoptChildNode(node, fn, shadowToken);
            }
        });
    });
}

function markElementAsPortal(elm: Element) {
    if (isUndefined(portalObserver)) {
        portalObserver = initPortalObserver();
    }
    if (isUndefined(getShadowRootResolver(elm))) {
        // only an element from a within a shadowRoot should be used here
        throw new Error(`Invalid Element`);
    }
    // install mutation observer for portals
    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig);
    // TODO: #1253 - optimization to synchronously adopt new child nodes added
    // to this elm, we can do that by patching the most common operations
    // on the node itself
}

/**
 * Patching Element.prototype.$domManual$ to mark elements as portal:
 *
 *  - we use a property to allow engines to signal that a particular element in
 *    a shadow supports manual insertion of child nodes.
 *
 *  - this signal comes as a boolean value, and we use it to install the MO instance
 *    onto the element, to propagate the $ownerKey$ and $shadowToken$ to all new
 *    child nodes.
 *
 *  - at the moment, there is no way to undo this operation, once the element is
 *    marked as $domManual$, setting it to false does nothing.
 *
 **/
// TODO: #1306 - rename this to $observerConnection$
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
    configurable: true,
});
