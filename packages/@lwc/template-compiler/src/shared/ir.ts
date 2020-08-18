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

export interface NodeVisitor<T extends IRNode> {
    enter?: (element: T) => void;
    exit?: (element: T) => void;
}

export interface Visitor {
    text?: NodeVisitor<IRText>;
    element?: NodeVisitor<IRElement>;
}

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

export function traverse(node: IRNode, visitor: Visitor): void {
    const { enter, exit }: NodeVisitor<any> = visitor[node.type] || {};

    if (enter) {
        enter(node);
    }

    if (isElement(node)) {
        for (const child of node.children) {
            traverse(child, visitor);
        }
    }

    if (exit) {
        exit(node);
    }
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

const memoizedIterators = new WeakMap<IRNode, string | null>();

function getIteratorName(node?: IRNode): string | null {
    if (!node) {
        return null;
    } else {
        let iteratorName = memoizedIterators.get(node);
        if (iteratorName !== undefined) {
            return iteratorName;
        }

        if (isElement(node)) {
            const { forOf } = node;
            if (forOf) {
                memoizedIterators.set(node, forOf.iterator.name);

                return forOf.iterator.name;
            }
        }

        iteratorName = getIteratorName(node.parent);
        memoizedIterators.set(node, iteratorName);

        return iteratorName;
    }
}

export function isBoundToIterator(identifier: TemplateIdentifier, node?: IRNode): boolean {
    return getIteratorName(node) === identifier.name;
}
