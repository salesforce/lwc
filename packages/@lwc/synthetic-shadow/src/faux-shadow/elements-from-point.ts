import { isNull, isUndefined } from '@lwc/shared';
import { elementsFromPoint as nativeElementsFromPoint } from '../env/document';
import { isSyntheticSlotElement } from '../faux-shadow/traverse';

function getAllRootNodes(node: Node) {
    const rootNodes = [];
    let currentRootNode = node.getRootNode();
    while (!isUndefined(currentRootNode)) {
        rootNodes.push(currentRootNode);
        currentRootNode = (currentRootNode as ShadowRoot).host?.getRootNode();
    }
    return rootNodes;
}

export function elementsFromPoint(
    context: Node,
    doc: Document,
    left: number,
    top: number
): Element[] {
    const elements: Element[] | null = nativeElementsFromPoint.call(doc, left, top);
    const result = [];

    const rootNodes = getAllRootNodes(context);

    const isInThisShadowTree = (element: Element) => {
        const otherRootNodes = getAllRootNodes(element);
        return otherRootNodes.every((node) => rootNodes.includes(node));
    };

    if (!isNull(elements)) {
        // can be null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint#browser_compatibility
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (isInThisShadowTree(element) && !isSyntheticSlotElement(element)) {
                result.push(element);
            }
        }
    }
    return result;
}
