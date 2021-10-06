/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { attributeToPropertyName } from '../parser/attribute';

import {
    LWCNodeType,
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
    LWCDirectiveDomMode,
    PreserveCommentsDirective,
    RenderModeDirective,
    LWCDirectiveRenderMode,
    Attribute,
    Property,
    ParentNode,
    BaseNode,
    ForOf,
    BaseElement,
    Directive,
    ParentWrapper,
    InnerHTMLDirective,
} from './types';

export function root(parse5Elm: parse5.Element, location: SourceLocation): Root {
    return {
        type: LWCNodeType.Root,
        name: parse5Elm.nodeName,
        children: [],
        location,
    };
}

export function element(parse5Elm: parse5.Element, location: SourceLocation): Element {
    return {
        type: LWCNodeType.Element,
        name: parse5Elm.nodeName,
        namespace: parse5Elm.namespaceURI,
        location,
        properties: [],
        attributes: [],
        listeners: [],
        children: [],
    };
}

export function component(parse5Elm: parse5.Element, location: SourceLocation): Component {
    return {
        type: LWCNodeType.Component,
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
        type: LWCNodeType.Slot,
        name,
        attributes: [],
        properties: [],
        listeners: [],
        children: [],
        location,
    };
}

export function text(value: Literal | Expression, parse5Location: parse5.Location): Text {
    return {
        type: LWCNodeType.Text,
        value,
        location: sourceLocation(parse5Location),
    };
}

export function comment(value: string, parse5Location: parse5.Location): Comment {
    return {
        type: LWCNodeType.Comment,
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
    item: Identifier,
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

export function forOf(
    name: string,
    expression: Expression,
    iterator: Identifier,
    location: SourceLocation
): ForOf {
    return {
        type: LWCNodeType.ForOf,
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

export function innerHTMLDirective(value: Expression | Literal<string>, location: SourceLocation): InnerHTMLDirective {
    return {
        type: LWCNodeType.Directive,
        name: LWCNodeType.InnerHTML,
        value,
        location,
    }
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

export function parentWrapper(node: ParentNode, parent?: ParentWrapper): ParentWrapper {
    return {
        parent,
        node,
    };
}

export function isElement(node: BaseNode): node is Element {
    return node.type === LWCNodeType.Element;
}

export function isRoot(node: BaseNode): node is Root {
    return node.type === LWCNodeType.Root;
}

export function isComponent(node: BaseNode): node is Component {
    return node.type === LWCNodeType.Component;
}

export function isSlot(node: BaseNode): node is Slot {
    return node.type === LWCNodeType.Slot;
}

export function isBaseElement(node: BaseNode): node is Element {
    return isElement(node) || isComponent(node) || isSlot(node);
}

export function isTextNode(node: BaseNode): node is Text {
    return node.type === LWCNodeType.Text;
}

export function isCommentNode(node: BaseNode): node is Comment {
    return node.type === LWCNodeType.Comment;
}

export function isTemplate(node: ParentNode): boolean {
    return node.name === 'template';
}

export function isExpression(node: Expression | Literal): node is Expression {
    return node.type === LWCNodeType.Identifier || node.type === LWCNodeType.MemberExpression;
}

export function isStringLiteral(node: Expression | Literal): node is Literal<string> {
    return node.type === LWCNodeType.Literal && typeof node.value === 'string';
}

export function isBooleanLiteral(node: Expression | Literal): node is Literal<boolean> {
    return node.type === LWCNodeType.Literal && typeof node.value === 'boolean';
}

export function isForOf(node: BaseNode): node is ForOf {
    return node.type === LWCNodeType.ForOf;
}

export function isForEach(node: BaseNode): node is ForEach {
    return node.type === LWCNodeType.ForEach;
}

export function isForBlock(node: BaseNode): node is ForBlock {
    return isForOf(node) || isForEach(node);
}

export function isIfBlock(node: BaseNode): node is IfBlock {
    return node.type === LWCNodeType.IfBlock;
}

export function isParentNode(node: BaseNode): node is ParentNode {
    return isBaseElement(node) || isRoot(node) || isForBlock(node) || isIfBlock(node);
}

export function isProperty(node: BaseNode): boolean {
    return node.type === LWCNodeType.Property;
}

export function isDynamicDirective(directive: Directive): directive is DynamicDirective {
    return directive.name === LWCNodeType.Dynamic;
}

export function isDomDirective(directive: Directive): directive is DomDirective {
    return directive.name === LWCNodeType.Dom;
}

export function isInnerHTMLDirective(directive: Directive): directive is InnerHTMLDirective {
    return directive.name === LWCNodeType.InnerHTML;
}

export function isRenderModeDirective(directive: Directive): directive is RenderModeDirective {
    return directive.name === LWCNodeType.RenderMode;
}

export function isPreserveComments(directive: Directive): directive is PreserveCommentsDirective {
    return directive.name === LWCNodeType.PreserveComments;
}

export function isKeyDirective(directive: Directive): directive is KeyDirective {
    return directive.name === LWCNodeType.Key;
}

export function getElementDirective(element: BaseElement, predicate: (dir: Directive) => boolean) {
    return element.directives?.find((dir) => predicate(dir));
}

export function getDomDirective(element: BaseElement) {
    return getElementDirective(element, isDomDirective) as DomDirective | undefined;
}

export function getKeyDirective(element: BaseElement) {
    return getElementDirective(element, isKeyDirective) as KeyDirective | undefined;
}

export function getRootDirective(root: Root, predicate: (dir: Directive) => boolean) {
    return root.directives?.find((dir) => predicate(dir));
}

export function getRenderModeDirective(root: Root) {
    return getRootDirective(root, isRenderModeDirective)?.value.value as
        | LWCDirectiveRenderMode
        | undefined;
}

export function getPreserveComments(root: Root) {
    return getRootDirective(root, isPreserveComments)?.value.value as boolean | undefined;
}
