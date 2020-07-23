import { ASTChildNode } from '../types';

export function previousSibling(node: ASTChildNode): ASTChildNode | null {
    const parentChildren = node.parent.children;
    const nodeIndex = parentChildren.indexOf(node);

    return nodeIndex > 0 ? parentChildren[nodeIndex - 1] : null;
}

export function nextSibling(node: ASTChildNode): ASTChildNode | null {
    const parentChildren = node.parent.children;
    const nodeIndex = parentChildren.indexOf(node);

    return nodeIndex < parentChildren.length - 1 ? parentChildren[nodeIndex + 1] : null;
}
