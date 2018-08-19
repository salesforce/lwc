import { ArrayPush, isNull, isUndefined } from "./language";
import { getNodeKey, getShadowRootHost } from "../framework/vm";
import { parentNodeGetter } from "../framework/dom-api";

const isShadowRoot = function(elmOrShadow: Node | ShadowRoot): elmOrShadow is ShadowRoot {
    return !(elmOrShadow instanceof Element) && 'host' in elmOrShadow;
};

const isLWC = function(element): element is HTMLElement {
    return !isShadowRoot(element) && !isUndefined(getNodeKey(element));
};

/**
 * Returns the component stack from an element.
 *
 * @param elm Element to get the component stack from.
 */
export function getComponentStack(elm: Element): HTMLElement[] {
    const wcStack: HTMLElement[] = [];
    let currentElement: Node | null = elm;

    do {
        if (isLWC(currentElement)) {
            ArrayPush.call(wcStack, currentElement);
        }

        if (isShadowRoot(currentElement)) {
            currentElement = getShadowRootHost(currentElement) || currentElement.host;
        } else {
            currentElement = parentNodeGetter.call(currentElement);
        }
    } while (!isNull(currentElement));

    return wcStack;
}
