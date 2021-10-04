/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';

export function isElementNode(node: parse5.Node): node is parse5.Element {
    return 'tagName' in node;
}

export function isCommentNode(node: parse5.Node): node is parse5.CommentNode {
    return node.nodeName === '#comment';
}

export function isTextNode(node: parse5.Node): node is parse5.TextNode {
    return node.nodeName === '#text';
}

export function getTemplateContent(
    templateElement: parse5.Element
): parse5.DocumentFragment | undefined {
    return (templateElement as any).content;
}
