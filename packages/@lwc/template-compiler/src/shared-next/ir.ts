/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { attributeToPropertyName } from '../parser-next/attribute';

import * as parse5Utils from './parse5';

import {
    LWCNodeType,
    Literal,
    SourceLocation,
    Element,
    Component,
    Expression,
    Node,
    Comment,
    Text,
    Iterator,
    ForEach,
    ForBlock,
    IfBlock,
    ElementNode,
    Slot,
    Identifier,
    Root,
    EventListener,
    KeyDirective,
    DynamicDirective,
    DomDirective,
    LWCDirectiveDomMode,
    PreserveCommentsDirective,
    RenderModeDirective,
    LWCDirectiveRenderMode,
    Attribute,
    Property,
    RootDirective,
    ParentNode,
} from './types';

export function root(original: parse5.Element): Root {
    return {
        type: LWCNodeType.Root,
        name: original.nodeName,
        children: [],
        location: parseElementSourceLocation(original),
    };
}

export function element(original: parse5.Element): Element {
    return {
        type: LWCNodeType.Element,
        name: original.nodeName,
        namespace: original.namespaceURI,
        location: parseElementSourceLocation(original),
        properties: [],
        attributes: [],
        listeners: [],
        children: [],
    };
}

export function component(original: parse5.Element): Component {
    return {
        type: LWCNodeType.Component,
        name: original.nodeName,
        location: parseElementSourceLocation(original),
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
    };
}

export function slot(name: string, location: SourceLocation): Slot {
    return {
        type: LWCNodeType.Slot,
        name,
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
        location,
    };
}

export function parseElementSourceLocation(original: parse5.Element): SourceLocation {
    const elementLocation = parseElementLocation(original);
    return parseSourceLocation(elementLocation);
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

// jtu: come back to this, should value be literal or literal<string>?
export function text(original: parse5.TextNode, value: Literal | Expression): Text {
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

export function comment(original: parse5.CommentNode, value: string): Comment {
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

export function literal(value: string | boolean): Literal {
    return {
        type: LWCNodeType.Literal,
        value,
    };
}

export function forEach(
    name: string,
    expression: Expression,
    location: SourceLocation,
    item?: Identifier,
    index?: Identifier
): ForEach {
    return {
        type: LWCNodeType.ForEach,
        name,
        expression,
        location,
        children: [],
        item,
        index,
    };
}

export function iterator(
    name: string,
    expression: Expression,
    iterator: Identifier,
    location: SourceLocation
): Iterator {
    return {
        type: LWCNodeType.Iterator,
        name,
        expression,
        iterator,
        location,
        children: [],
    };
}

export function ifBlock(
    name: string,
    location: SourceLocation,
    modifier: string,
    condition: Expression
): IfBlock {
    return {
        type: LWCNodeType.IfBlock,
        name,
        location,
        children: [],
        modifier,
        condition,
    };
}

export function eventListener(
    name: string,
    handler: Expression,
    location: SourceLocation
): EventListener {
    return {
        type: LWCNodeType.EventListener,
        name,
        handler,
        location,
    };
}

export function keyDirective(value: Expression, location: SourceLocation): KeyDirective {
    return {
        type: LWCNodeType.Directive,
        name: LWCNodeType.Key,
        value,
        location,
    };
}

export function dynamicDirective(value: Expression, location: SourceLocation): DynamicDirective {
    return {
        name: LWCNodeType.Dynamic,
        value,
        type: LWCNodeType.Directive,
        location,
    };
}

export function domDirective(lwcDomAttr: string, location: SourceLocation): DomDirective {
    return {
        type: LWCNodeType.Directive,
        name: LWCNodeType.Dom,
        value: {
            type: LWCNodeType.Literal,
            value: lwcDomAttr as LWCDirectiveDomMode,
        },
        location,
    };
}

export function preserveCommentsDirective(
    preserveComments: boolean,
    location: SourceLocation
): PreserveCommentsDirective {
    return {
        name: LWCNodeType.PreserveComments,
        value: {
            type: LWCNodeType.Literal,
            value: preserveComments,
        },
        type: LWCNodeType.Directive,
        location,
    };
}

export function renderModeDirective(
    renderMode: string,
    location: SourceLocation
): RenderModeDirective {
    return {
        name: LWCNodeType.RenderMode,
        value: {
            type: LWCNodeType.Literal,
            value: renderMode as LWCDirectiveRenderMode,
        },
        type: LWCNodeType.Directive,
        location,
    };
}

export function attribute(
    name: string,
    value: Expression | Literal,
    location: SourceLocation
): Attribute {
    return {
        type: LWCNodeType.Attribute,
        name,
        value,
        location,
    };
}

export function property(
    name: string,
    value: Expression | Literal,
    location: SourceLocation
): Property {
    return {
        type: LWCNodeType.Property,
        name: attributeToPropertyName(name),
        value,
        location,
    };
}

export function isElement(node: Node): node is Element {
    return node.type === LWCNodeType.Element;
}

export function isRoot(node: Node): node is Root {
    return node.type === LWCNodeType.Root;
}

export function isComponent(node: Node): node is Component {
    return node.type === LWCNodeType.Component;
}

export function isSlot(node: Node) {
    return node.type === LWCNodeType.Slot;
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
// how does this interact when it's a slot?
export function isCustomElement(node: Node): boolean {
    return node.type === LWCNodeType.Component;
}

// jtu:  Come back to this
export function isTemplate(node: ElementNode) {
    return node.name === 'template';
}

export function isIdentifier(expression: Expression | Literal): expression is Identifier {
    return expression.type === LWCNodeType.Identifier;
}

export function isExpressionAttribute(node: Expression | Literal): node is Expression {
    return node.type === LWCNodeType.Identifier || node.type === LWCNodeType.MemberExpression;
}

// jtu: come back to this and verify that it is correct usage.
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

export function isAttribute(node: Node): node is Attribute {
    return node.type === LWCNodeType.Attribute;
}

export function isLiteral(node: Node): node is Literal {
    return node.type === LWCNodeType.Literal;
}

// jtu:  com eback ot this looks like it coudl be combo'd with isStringAttribute
export function isStringLiteral(node: Node): node is Literal<string> {
    return node.type === LWCNodeType.Literal && typeof node.value === 'string';
}

// jtu:  below this line needs work, find better ways of doing these
// most of these are for codegen

export function isParentNode(node: Node): node is ParentNode {
    return !isCommentNode(node) || !isTextNode(node) || !isAttribute(node);
}

export function hasAttributes(node: Node): node is Element {
    return isElement(node) || isComponent(node) || isSlot(node);
}

// jtu: come back to this seems like there's a better way to do this
export function isRenderModeDirective(directive: RootDirective): directive is RenderModeDirective {
    return directive.name === LWCNodeType.RenderMode;
}

export function isPreserveComments(
    directive: RootDirective
): directive is PreserveCommentsDirective {
    return directive.name === LWCNodeType.PreserveComments;
}

// export function getDirectiveValue(node: DirectiveNode, type: LWCNodeType) {
//     return node.directives?.find(dir => dir.name === type)?.value.value;
// }

export function getRenderModeDirective(root: Root) {
    return root.directives?.find((dir) => isRenderModeDirective(dir))?.value.value as
        | LWCDirectiveRenderMode
        | undefined;
}

export function getPreserveComments(root: Root) {
    return root.directives?.find((dir) => isPreserveComments(dir))?.value.value as
        | boolean
        | undefined;
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
