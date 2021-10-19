/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';

import * as parse5Utils from './parse5';

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

export function createElement(original: parse5.Element, parent?: IRElement): IRElement {
    let location = original.sourceCodeLocation;

    // With parse5 automatically recovering from invalid HTML, some AST nodes might not have
    // location information. For example when a <table> element has a <tr> child element, parse5
    // creates a <tbody> element in the middle without location information. In this case, we
    // can safely skip the closing tag validation.
    //
    // TODO [#248]: Report a warning when location is not available indicating the original HTML
    // template is not valid.
    let current = original;
    while (!location && parse5Utils.isElementNode(original.parentNode)) {
        current = original.parentNode;
        location = current.sourceCodeLocation;
    }

    if (!location) {
        // eslint-disable-next-line no-console
        console.warn('Invalid element AST node. Missing source code location.');
    }

    return {
        type: 'element',
        tag: original.tagName,
        namespace: original.namespaceURI,
        children: [],
        // Parent's location is used as the fallback in case the current node's location cannot be found.
        // If parent is not supplied, ie when the current node is the root, use an empty parse5.ElementLocation instead.
        location: location ?? parent?.location ?? parse5Utils.createEmptyElementLocation(),
        __original: original,
    };
}

export function createText(
    original: parse5.TextNode,
    value: string | TemplateExpression,
    parent: IRElement
): IRText {
    if (!original.sourceCodeLocation) {
        // eslint-disable-next-line no-console
        console.warn('Invalid text AST node. Missing source code location.');
    }

    return {
        type: 'text',
        value,
        location: original.sourceCodeLocation ?? parent.location,
    };
}

export function createComment(
    original: parse5.CommentNode,
    value: string,
    parent: IRElement
): IRComment {
    if (!original.sourceCodeLocation) {
        // eslint-disable-next-line no-console
        console.warn('Invalid comment AST node. Missing source code location.');
    }

    return {
        type: 'comment',
        value,
        location: original.sourceCodeLocation ?? parent.location,
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
