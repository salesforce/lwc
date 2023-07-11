/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Token } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { Tokenizer } from 'parse5';

export type Preprocessor = Tokenizer['preprocessor'];
export type ElementLocation = Token.ElementLocation;
export type ChildNode = DefaultTreeAdapterMap['childNode'];
export type CommentNode = DefaultTreeAdapterMap['commentNode'];
export type Document = DefaultTreeAdapterMap['document'];
export type DocumentFragment = DefaultTreeAdapterMap['documentFragment'];
export type Element = DefaultTreeAdapterMap['element'];
export type Node = DefaultTreeAdapterMap['node'];
export type Template = DefaultTreeAdapterMap['template'];
export type TextNode = DefaultTreeAdapterMap['textNode'];

export { Token };

export function isElementNode(node: Node | null): node is Element {
    return node !== null && 'tagName' in node;
}

export function isCommentNode(node: Node): node is CommentNode {
    return node.nodeName === '#comment';
}

export function isTextNode(node: Node): node is TextNode {
    return node.nodeName === '#text';
}

export function isTemplateNode(node: Node): node is Template {
    return isElementNode(node) && node.tagName === 'template';
}

export function getTemplateContent(
    templateElement: Element | Template
): DocumentFragment | undefined {
    return isTemplateNode(templateElement) ? templateElement.content : undefined;
}
