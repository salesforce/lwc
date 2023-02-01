/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CommentNode,
    DocumentFragment,
    Element,
    Node,
    TextNode,
} from 'parse5/dist/tree-adapters/default';

export function isElementNode(node: Node): node is Element {
    return 'tagName' in node;
}

export function isCommentNode(node: Node): node is CommentNode {
    return node.nodeName === '#comment';
}

export function isTextNode(node: Node): node is TextNode {
    return node.nodeName === '#text';
}

export function getTemplateContent(templateElement: Element): DocumentFragment | undefined {
    return (templateElement as any).content;
}
