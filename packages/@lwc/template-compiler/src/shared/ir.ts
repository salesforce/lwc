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
} from './types';

export function createElement(tag: string, original: HTMLElement): IRElement {
    return {
        type: 'element',
        __original: original,

        tag,
        attrsList: [],
        children: [],
    };
}

export function createText(original: HTMLText, value: string | TemplateExpression): IRText {
    return {
        type: 'text',
        __original: original,
        value,
    };
}

export function isElement(node: IRNode): node is IRElement {
    return node.type === 'element';
}

export function isCustomElement(node: IRNode): boolean {
    return !!(node as IRElement).component;
}

export function isComponentProp(identifier: TemplateIdentifier, node?: IRNode): boolean {
    if (!node) {
        return true;
    }

    // Make sure the identifier is not bound to any iteration variable
    if (isElement(node)) {
        const { forEach, forOf } = node;
        const boundToForItem = forEach && forEach.item.name === identifier.name;
        const boundToForIndex = forEach && forEach.index && forEach.index.name === identifier.name;
        const boundToForIterator = forOf && forOf.iterator.name === identifier.name;

        if (boundToForItem || boundToForIndex || boundToForIterator) {
            return false;
        }
    }

    // Delegate to parent component if no binding is found at this point
    return isComponentProp(identifier, node.parent);
}
