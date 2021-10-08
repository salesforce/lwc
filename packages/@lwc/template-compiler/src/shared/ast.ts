/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';

import {
    Literal,
    SourceLocation,
    Element,
    Component,
    Expression,
    Comment,
    Text,
    ForEach,
    ForBlock,
    IfBlock,
    Slot,
    Identifier,
    Root,
    EventListener,
    KeyDirective,
    DynamicDirective,
    DomDirective,
    PreserveCommentsDirective,
    RenderModeDirective,
    Attribute,
    Property,
    ParentNode,
    BaseNode,
    ForOf,
    ElementDirective,
    RootDirective,
    Directive,
    InnerHTMLDirective,
} from './types';

export function root(parse5Elm: parse5.Element, location: SourceLocation): Root {
    return {
        type: 'Root',
        name: parse5Elm.nodeName,
        location,
        children: [],
    };
}

export function element(parse5Elm: parse5.Element, location: SourceLocation): Element {
    return {
        type: 'Element',
        name: parse5Elm.nodeName,
        namespace: parse5Elm.namespaceURI,
        location,
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
    };
}

export function component(parse5Elm: parse5.Element, location: SourceLocation): Component {
    return {
        type: 'Component',
        name: parse5Elm.nodeName,
        location,
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
    };
}

export function slot(name: string, location: SourceLocation): Slot {
    return {
        type: 'Slot',
        name,
        location,
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
    };
}

export function text(value: Literal | Expression, parse5Location: parse5.Location): Text {
    return {
        type: 'Text',
        value,
        location: sourceLocation(parse5Location),
    };
}

export function comment(value: string, parse5Location: parse5.Location): Comment {
    return {
        type: 'Comment',
        value,
        location: sourceLocation(parse5Location),
    };
}

export function sourceLocation(location?: parse5.Location): SourceLocation {
    return {
        startLine: location?.startLine ?? 0,
        startColumn: location?.startCol ?? 0,
        endLine: location?.endLine ?? 0,
        endColumn: location?.endCol ?? 0,
        start: location?.startOffset ?? 0,
        end: location?.endOffset ?? 0,
    };
}

export function literal<T extends string | boolean>(value: T): Literal<T> {
    return {
        type: 'Literal',
        value,
    };
}

export function forEach(
    expression: Expression,
    location: SourceLocation,
    item: Identifier,
    index?: Identifier
): ForEach {
    return {
        type: 'ForEach',
        expression,
        item,
        index,
        location,
        children: [],
    };
}

export function forOf(
    expression: Expression,
    iterator: Identifier,
    location: SourceLocation
): ForOf {
    return {
        type: 'ForOf',
        expression,
        iterator,
        location,
        children: [],
    };
}

export function ifBlock(
    location: SourceLocation,
    modifier: string,
    condition: Expression
): IfBlock {
    return {
        type: 'IfBlock',
        modifier,
        condition,
        location,
        children: [],
    };
}

export function eventListener(
    name: string,
    handler: Expression,
    location: SourceLocation
): EventListener {
    return {
        type: 'EventListener',
        name,
        handler,
        location,
    };
}

export function keyDirective(value: Expression, location: SourceLocation): KeyDirective {
    return {
        type: 'Directive',
        name: 'Key',
        value,
        location,
    };
}

export function dynamicDirective(value: Expression, location: SourceLocation): DynamicDirective {
    return {
        type: 'Directive',
        name: 'Dynamic',
        value,
        location,
    };
}

export function domDirective<T extends 'manual'>(
    lwcDomAttr: T,
    location: SourceLocation
): DomDirective {
    return {
        type: 'Directive',
        name: 'Dom',
        value: literal(lwcDomAttr),
        location,
    };
}

export function innerHTMLDirective(value: Expression | Literal<string>, location: SourceLocation): InnerHTMLDirective {
    return {
        type: 'Directive',
        name: 'InnerHTML',
        value,
        location,
    }
}

export function preserveCommentsDirective(
    preserveComments: boolean,
    location: SourceLocation
): PreserveCommentsDirective {
    return {
        type: 'Directive',
        name: 'PreserveComments',
        value: literal(preserveComments),
        location,
    };
}

export function renderModeDirective<T extends 'light', K extends 'shadow'>(
    renderMode: T | K,
    location: SourceLocation
): RenderModeDirective {
    return {
        type: 'Directive',
        name: 'RenderMode',
        value: literal(renderMode),
        location,
    };
}

export function attribute(
    name: string,
    value: Expression | Literal,
    location: SourceLocation
): Attribute {
    return {
        type: 'Attribute',
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
        type: 'Property',
        name,
        value,
        location,
    };
}

export function isElement(node: BaseNode): node is Element {
    return node.type === 'Element';
}

export function isRoot(node: BaseNode): node is Root {
    return node.type === 'Root';
}

export function isComponent(node: BaseNode): node is Component {
    return node.type === 'Component';
}

export function isSlot(node: BaseNode): node is Slot {
    return node.type === 'Slot';
}

export function isBaseElement(node: BaseNode): node is Element | Component | Slot {
    return isElement(node) || isComponent(node) || isSlot(node);
}

export function isTextNode(node: BaseNode): node is Text {
    return node.type === 'Text';
}

export function isCommentNode(node: BaseNode): node is Comment {
    return node.type === 'Comment';
}

export function isTemplate(node: ParentNode): boolean {
    return (isBaseElement(node) || isRoot(node)) && node.name === 'template';
}

export function isExpression(node: Expression | Literal): node is Expression {
    return node.type === 'Identifier' || node.type === 'MemberExpression';
}

export function isStringLiteral(node: Expression | Literal): node is Literal<string> {
    return node.type === 'Literal' && typeof node.value === 'string';
}

export function isBooleanLiteral(node: Expression | Literal): node is Literal<boolean> {
    return node.type === 'Literal' && typeof node.value === 'boolean';
}

export function isForOf(node: BaseNode): node is ForOf {
    return node.type === 'ForOf';
}

export function isForEach(node: BaseNode): node is ForEach {
    return node.type === 'ForEach';
}

export function isForBlock(node: BaseNode): node is ForBlock {
    return isForOf(node) || isForEach(node);
}

export function isIfBlock(node: BaseNode): node is IfBlock {
    return node.type === 'IfBlock';
}

export function isParentNode(node: BaseNode): node is ParentNode {
    return isBaseElement(node) || isRoot(node) || isForBlock(node) || isIfBlock(node);
}

export function isProperty(node: BaseNode): boolean {
    return node.type === 'Property';
}

export function isInnerHTMLDirective(directive: Directive): directive is InnerHTMLDirective {
    return directive.name === 'InnerHTML';
}

export function isDirectiveType<D extends ElementDirective | RootDirective, T extends D['name']>(
    type: T
): (directive: D) => directive is Extract<D, Record<'name', T>> {
    return (directive: D): directive is Extract<D, Record<'name', T>> => directive.name === type;
}
