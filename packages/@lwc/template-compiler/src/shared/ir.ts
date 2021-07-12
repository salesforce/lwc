/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    TemplateIdentifier,
    TemplateExpression,
    IRNode,
    IRText,
    IRElement,
    HTMLElement,
    HTMLText,
    HTMLComment,
    IRComment,
    IRInterpolatedText,
} from './types';

export function createElement(original: HTMLElement, parent?: IRElement): IRElement {
    return {
        type: 'element',
        tag: original.tagName,
        namespace: original.namespaceURI,
        attrsList: original.attrs,
        parent,
        children: [],
        __original: original,
    };
}

export function createText(
    original: HTMLText,
    parent: IRElement,
    value: string | TemplateExpression
): IRText {
    return {
        type: 'text',
        parent,
        value,
        __original: original,
    };
}

export function createInterpolatedText(
    original: HTMLText,
    parent: IRElement,
    value: Array<string | TemplateExpression>
): IRInterpolatedText {
    return {
        type: 'interpolatedText',
        parent,
        value,
        __original: original,
    };
}

export function createComment(original: HTMLComment, parent: IRElement, value: string): IRComment {
    return {
        type: 'comment',
        parent,
        value,
        __original: original,
    };
}

export function isElement(node: IRNode): node is IRElement {
    return node.type === 'element';
}

export function isTextNode(node: IRNode): node is IRText {
    return node.type === 'text';
}

export function isInterpolatedTextNode(node: IRNode): node is IRInterpolatedText {
    return node.type === 'interpolatedText';
}

export function isCommentNode(node: IRNode): node is IRComment {
    return node.type === 'comment';
}

export function isCustomElement(node: IRNode): boolean {
    return isElement(node) && node.component !== undefined;
}

export function isTemplate(element: IRElement) {
    return element.tag === 'template';
}

export function isSlot(element: IRElement) {
    return element.tag === 'slot';
}

export function isComponentProp(identifier: TemplateIdentifier, root: IRNode): boolean {
    const { name } = identifier;
    let current: IRNode | undefined = root;

    // Walking up the AST and checking for each node to find if the identifer name is identical to
    // an iteration variable.
    while (current !== undefined) {
        if (isElement(current)) {
            const { forEach, forOf } = current;

            if (
                forEach?.item.name === name ||
                forEach?.index?.name === name ||
                forOf?.iterator.name === name
            ) {
                return false;
            }
        }

        current = current.parent;
    }

    // The identifier is bound to a component property if no match is found after reaching to AST
    // root.
    return true;
}
