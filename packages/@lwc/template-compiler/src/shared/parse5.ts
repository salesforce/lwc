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

// Creates a parse5.ElementLocation where all values are set to 0.
export function createEmptyElementLocation(): parse5.ElementLocation {
    const startTag = createEmptyStartTagLocation();
    const endTag = createEmptyLocation();
    const elementLocation = createEmptyStartTagLocation();

    return { ...elementLocation, startTag, endTag };
}

function createEmptyStartTagLocation(): parse5.StartTagLocation {
    return { attrs: {}, ...createEmptyLocation() };
}

function createEmptyLocation(): parse5.Location {
    return { startCol: 0, startOffset: 0, startLine: 0, endCol: 0, endOffset: 0, endLine: 0 };
}
