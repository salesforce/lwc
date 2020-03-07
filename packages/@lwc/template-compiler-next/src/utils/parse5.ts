import * as parse5 from 'parse5';

export interface TemplateElement extends parse5.Element {
    content: parse5.DocumentFragment;
}

export function isElement(node: parse5.Node): node is parse5.Element {
    return !node.nodeName.startsWith('#');
}

export function isCommentNode(node: parse5.Node): node is parse5.CommentNode {
    return node.nodeName === '#comment';
}

export function isTextNode(node: parse5.Node): node is parse5.TextNode {
    return node.nodeName === '#text';
}

export function isTemplate(node: parse5.Element): node is TemplateElement {
    return node.tagName === 'template' && 'content' in node;
}
