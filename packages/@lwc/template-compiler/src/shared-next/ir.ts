/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';

import * as parse5Utils from './parse5';

import {
    // TemplateIdentifier,
    // IRNode,
    LWCNodeType,
    Literal,
    SourceLocation,
    Element,
    Component,
    Expression,
    Node,
    Comment,
    Text,
    ParentNode,
    ParentWrapper,
    Iterator,
    ForEach,
    ForBlock,
    IfBlock,
} from './types';

export function createElement(original: parse5.Element): Element {
    const elmLocation = parseElementLocation(original);
    return {
        type: LWCNodeType.Element,
        name: original.nodeName,
        namespace: original.namespaceURI,
        location: parseSourceLocation(elmLocation),
        properties: [],
        attributes: [],
        listeners: [],
        children: [],
    };
}

export function createComponent(original: parse5.Element): Component {
    const elmLocation = parseElementLocation(original);
    return {
        type: LWCNodeType.Component,
        name: original.nodeName,
        location: parseSourceLocation(elmLocation),
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
    };
}

export function parseElementLocation(original: parse5.Element): parse5.ElementLocation {
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

    return location;
}

export function createParentWrapper(node: ParentNode, parent?: ParentWrapper) {
    return {
        parent,
        node,
    };
}

// jtu: come back to this, should value be literal or literal<string>?
export function createText(original: parse5.TextNode, value: Literal | Expression): Text {
    if (!original.sourceCodeLocation) {
        throw new Error('Invalid text AST node. Missing source code location.');
    }

    const location = parseSourceLocation(original.sourceCodeLocation);

    return {
        type: LWCNodeType.Text,
        value,
        location,
    };
}

export function createComment(original: parse5.CommentNode, value: string): Comment {
    if (!original.sourceCodeLocation) {
        throw new Error('Invalid comment AST node. Missing source code location.');
    }

    const location = parseSourceLocation(original.sourceCodeLocation);

    return {
        type: LWCNodeType.Comment,
        value,
        location,
    };
}

export function createLiteral(value: string | boolean): Literal {
    return {
        type: LWCNodeType.Literal,
        value,
    };
}

export function parseSourceLocation(location: parse5.Location): SourceLocation {
    return {
        startLine: location.startLine,
        startColumn: location.startCol,
        endLine: location.endLine,
        endColumn: location.endCol,
        start: location.startOffset,
        end: location.endOffset,
    };
}

export function isElement(node: Node): node is Element {
    return node.type === LWCNodeType.Element;
}

export function isTextNode(node: Node): node is Text {
    return node.type === LWCNodeType.Text;
}

export function isCommentNode(node: Node): node is Comment {
    return node.type === LWCNodeType.Comment;
}

// export function isCustomElement(node: IRNode): boolean {
//     return isElement(node) && node.component !== undefined;
// }

// jtu:  comeback to verify this is correct
export function isCustomElement(node: Node): boolean {
    return node.type === LWCNodeType.Component;
}

// jtu:  Come back to this
export function isTemplate(node: Node) {
    return (
        (node.type === LWCNodeType.Element ||
            node.type === LWCNodeType.Component ||
            node.type === LWCNodeType.Slot ||
            node.type === LWCNodeType.Root) &&
        node.name === 'template'
    );
}

export function isSlot(node: Node) {
    return node.type === LWCNodeType.Slot;
}

export function isExpressionAttribute(node: Expression | Literal): node is Expression {
    return node.type === LWCNodeType.Identifier || node.type === LWCNodeType.MemberExpression;
}

export function isStringAttribute(node: Expression | Literal): node is Literal<string> {
    return node.type === LWCNodeType.Literal && typeof node.value === 'string';
}

export function isBooleanAttribute(node: Expression | Literal): node is Literal<boolean> {
    return node.type === LWCNodeType.Literal && typeof node.value === 'boolean';
}

export function isIterator(node: Node): node is Iterator {
    return node.type === LWCNodeType.Iterator;
}

export function isForEach(node: Node): node is ForEach {
    return node.type === LWCNodeType.ForEach;
}

export function isForBlock(node: Node): node is ForBlock {
    return isIterator(node) || isForEach(node);
}

export function isIfBlock(node: Node): node is IfBlock {
    return node.type === LWCNodeType.IfBlock;
}

// export function isComponentProp(
//     identifier: TemplateIdentifier,
//     root: IRNode,
//     parentStack: IRNode[]
// ): boolean {
//     const { name } = identifier;
//     let current: IRNode | undefined = root;

//     // Walking up the AST and checking for each node to find if the identifer name is identical to
//     // an iteration variable.
//     for (let i = parentStack.length; i >= 0; i--) {
//         if (isElement(current)) {
//             const { forEach, forOf } = current;

//             if (
//                 forEach?.item.name === name ||
//                 forEach?.index?.name === name ||
//                 forOf?.iterator.name === name
//             ) {
//                 return false;
//             }
//         }

//         current = parentStack[i - 1];
//     }

//     // The identifier is bound to a component property if no match is found after reaching to AST
//     // root.
//     return true;
// }
