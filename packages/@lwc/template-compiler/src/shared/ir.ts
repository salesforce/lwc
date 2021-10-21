/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';

import {
    TemplateIdentifier,
    TemplateExpression,
    IRNode,
    IRText,
    IRElement,
    IRComment,
    IRAttribute,
    IRAttributeType,
    IRExpressionAttribute,
    IRStringAttribute,
    IRBooleanAttribute,
} from './types';

export function createElement(
    original: parse5.Element,
    location: parse5.ElementLocation
): IRElement {
    return {
        type: 'element',
        tag: original.tagName,
        namespace: original.namespaceURI,
        children: [],
        location,
        __original: original,
    };
}

export function createText(value: string | TemplateExpression, location: parse5.Location): IRText {
    return {
        type: 'text',
        value,
        location,
    };
}

export function createComment(value: string, location: parse5.Location): IRComment {
    return {
        type: 'comment',
        value,
        location,
    };
}

export function isElement(node: IRNode): node is IRElement {
    return node.type === 'element';
}

export function isTextNode(node: IRNode): node is IRText {
    return node.type === 'text';
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

export function isIRExpressionAttribute(
    attribute: IRAttribute
): attribute is IRExpressionAttribute {
    return attribute.type === IRAttributeType.Expression;
}

export function isIRStringAttribute(attribute: IRAttribute): attribute is IRStringAttribute {
    return attribute.type === IRAttributeType.String;
}

export function isIRBooleanAttribute(attribute: IRAttribute): attribute is IRBooleanAttribute {
    return attribute.type === IRAttributeType.Boolean;
}

export function isComponentProp(
    identifier: TemplateIdentifier,
    root: IRNode,
    parentStack: IRNode[]
): boolean {
    const { name } = identifier;
    let current: IRNode | undefined = root;

    // Walking up the AST and checking for each node to find if the identifer name is identical to
    // an iteration variable.
    for (let i = parentStack.length; i >= 0; i--) {
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

        current = parentStack[i - 1];
    }

    // The identifier is bound to a component property if no match is found after reaching to AST
    // root.
    return true;
}
