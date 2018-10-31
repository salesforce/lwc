import {
    isUndefined,
    isNull,
    isTrue,
    defineProperties,
    forEach,
} from '../shared/language';
import { parentNodeGetter } from '../env/node';
import { MutationObserver, MutationObserverObserve } from '../env/window';
import { setAttribute } from '../env/element';

/**
 * Returns the context shadow included root.
 */
function findShadowRoot(node: Node): Node {
    const initialParent = parentNodeGetter.call(node);
    // We need to ensure that the parent element is present before accessing it.
    if (isNull(initialParent)) {
        return node;
    }

    // In the case of LWC, the root and the host element are the same things. Therefor,
    // when calling findShadowRoot on the a host element we want to return the parent host
    // element and not the current host element.
    node = initialParent;
    let nodeParent;
    while (
        !isNull(nodeParent = parentNodeGetter.call(node)) &&
        isUndefined(getNodeKey(node))
    ) {
        node = nodeParent;
    }

    return node;
}

function findComposedRootNode(node: Node): Node {
    let nodeParent;
    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
        node = nodeParent;
    }

    return node;
}

/**
 * Dummy implementation of the Node.prototype.getRootNode.
 * Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode
 *
 * TODO: Once we start using the real shadowDOM, this method should be replaced by:
 * const { getRootNode } = Node.prototype;
 */
export function getRootNode(
    this: Node,
    options?: { composed?: boolean }
): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        findComposedRootNode(this) :
        findShadowRoot(this);
}

const NodePatchDescriptors: PropertyDescriptorMap = {};

export function patchNode(node: Node) {
    // TODO: we are nos invoking this yet, but it will be interesting to do
    // so for any element from the template.
    defineProperties(node, NodePatchDescriptors);
}

// DO NOT CHANGE this:
// these two values need to be in sync with framework/vm.ts
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export function getNodeOwnerKey(node: Node): number | undefined {
    return node[OwnerKey];
}

export function setNodeOwnerKey(node: Node, key: number) {
    node[OwnerKey] = key;
}

export function getNodeNearestOwnerKey(node: Node): number | undefined {
    let ownerKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = node[OwnerKey]))) {
        node = parentNodeGetter.call(node);
    }
    return ownerKey;
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}

const portals: WeakMap<Element, 1> = new WeakMap();

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let portalObserver;

const portalObserverConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
};

function initPortalObserver() {
    return new MutationObserver(mutations => {
        forEach.call(mutations, mutation => {
            const { target: elm, addedNodes } = mutation;
            const ownerKey = getNodeOwnerKey(elm);
            const shadowToken = getCSSToken(elm);
            if (isUndefined(ownerKey)) {
                throw new ReferenceError(`Internal Error`);
            }
            for (let i = 0, len = addedNodes.length; i < len; i += 1) {
                const node: Node = addedNodes[i];
                setNodeOwnerKey(node, ownerKey);
                if (node instanceof HTMLElement) {
                    setCSSToken(node, shadowToken);
                }
            }
        });
    });
}

const ShadowTokenKey = '$$ShadowTokenKey$$';

export function setCSSToken(elm: Element, shadowToken) {
    if (!isUndefined(shadowToken)) {
        setAttribute.call(elm, shadowToken, '');
        elm[ShadowTokenKey] = shadowToken;
    }
}

function getCSSToken(elm: Element): string | undefined {
    return elm[ShadowTokenKey];
}

export function markElementAsPortal(elm: Element) {
    portals.set(elm, 1);
    if (!portalObserver) {
        portalObserver = initPortalObserver();
    }
    // install mutation observer for portals
    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig);
}

export function isPortalElement(elm: Element): boolean {
    return portals.has(elm);
}
