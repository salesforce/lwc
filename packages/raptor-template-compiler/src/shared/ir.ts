import {
    TemplateIdentifier,
    TemplateExpression,
    IRNode,
    IRText,
    IRElement,
    HTMLElement,
    HTMLText,
} from './types';

export type VisitorFn = (element: IRNode) => void;

export interface NodeVisitor {
    enter?: VisitorFn;
    exit?: VisitorFn;
}

export interface Visitor {
    [type: string]: NodeVisitor;
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

export function isText(node: IRNode): node is IRText {
    return node.type === 'text';
}

export function traverse(node: IRNode, visitor: Visitor): void {
    const nodeVisitor = visitor[node.type] || {};
    const { enter, exit } = nodeVisitor;

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
        const { forItem, forIterator } = node;
        const boundToForItem = forItem && forItem.name === identifier.name;
        const boundToForIterator = forIterator && forIterator.name === identifier.name;

        if (boundToForItem || boundToForIterator) {
            return false;
        }
    }

    // Delegate to parent component if no binding is found at this point
    return isComponentProp(identifier, node.parent);
}
