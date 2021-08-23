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
        throw new Error('Invalid element AST node. Missing source code location.');
    }

    return {
        type: 'element',
        tag: original.tagName,
        namespace: original.namespaceURI,
        parent,
        children: [],
        location,
        __original: original,
    };
}

export function createText(
    original: parse5.TextNode,
    parent: IRElement,
    value: string | TemplateExpression
): IRText {
    if (!original.sourceCodeLocation) {
        throw new Error('Invalid text AST node. Missing source code location.');
    }

    return {
        type: 'text',
        parent,
        value,
        location: original.sourceCodeLocation,
    };
}

export function createComment(
    original: parse5.CommentNode,
    parent: IRElement,
    value: string
): IRComment {
    if (!original.sourceCodeLocation) {
        throw new Error('Invalid comment AST node. Missing source code location.');
    }

    return {
        type: 'comment',
        parent,
        value,
        location: original.sourceCodeLocation,
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
