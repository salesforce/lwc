/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5Type from '../parser/parse5Types';

export function isElementNode(node: parse5Type.Node): node is parse5Type.Element {
    return 'tagName' in node;
}

export function isCommentNode(node: parse5Type.Node): node is parse5Type.CommentNode {
    return node.nodeName === '#comment';
}

export function isTextNode(node: parse5Type.Node): node is parse5Type.TextNode {
    return node.nodeName === '#text';
}

export function getTemplateContent(
    templateElement: parse5Type.Element
): parse5Type.DocumentFragment | undefined {
    return (templateElement as any).content;
}
