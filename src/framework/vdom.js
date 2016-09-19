// @flow

export function patchChildrenNodes(domNode: Node, newChildNodes: Array<Node>) {
    const oldChildNodes = [...domNode.childNodes];
    let len = Math.max(oldChildNodes.length, newChildNodes.length);
    for (let i = 0; i < len; i += 1) {
        const oldDomNode = oldChildNodes[i];
        const newDomNode = newChildNodes[i];
        if (newDomNode !== oldDomNode) {
            if (newDomNode && !oldDomNode) {
                domNode.appendChild(newDomNode);
            } else if (newDomNode && oldDomNode) {
                domNode.insertBefore(newDomNode, oldDomNode);
            }
            if (oldDomNode && newChildNodes.indexOf(oldDomNode) === -1) {
                domNode.removeChild(oldDomNode);
            }
        }
    }
}
