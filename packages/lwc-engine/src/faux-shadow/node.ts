import {
    isUndefined,
    isNull,
    forEach,
} from '../shared/language';
import { parentNodeGetter } from '../env/node';
import { MutationObserver, MutationObserverObserve } from '../env/window';
import { setAttribute } from '../env/element';

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

export function setCSSToken(elm: Element, shadowToken: string | undefined) {
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
