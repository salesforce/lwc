/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { HTML_NAMESPACE } from '@lwc/shared';
import { Token as parse5TokenInfo } from 'parse5';
import {
    Literal,
    SourceLocation,
    Element,
    ExternalComponent,
    Component,
    Expression,
    ComplexExpression,
    Comment,
    Text,
    ForEach,
    ForBlock,
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
    LWCDirectiveRenderMode,
    If,
    IfBlock,
    ElseBlock,
    ElseifBlock,
    ElementSourceLocation,
    InnerHTMLDirective,
    BaseElement,
    LWCDirectiveDomMode,
    RefDirective,
    SpreadDirective,
    ElementDirective,
    RootDirective,
    SlotBindDirective,
    ScopedSlotFragment,
    SlotDataDirective,
    IsDirective,
    LwcComponent,
    LwcTagName,
    BaseLwcElement,
} from './types';

export function root(parse5ElmLocation: parse5TokenInfo.ElementLocation): Root {
    return {
        type: 'Root',
        location: elementSourceLocation(parse5ElmLocation),
        directives: [],
        children: [],
    };
}

export function element(
    tagName: string,
    namespaceURI: string,
    parse5ElmLocation: parse5TokenInfo.ElementLocation
): Element {
    return {
        type: 'Element',
        name: tagName,
        namespace: namespaceURI,
        location: elementSourceLocation(parse5ElmLocation),
        attributes: [],
        properties: [],
        directives: [],
        listeners: [],
        children: [],
    };
}

export function externalComponent(
    tagName: string,
    parse5ElmLocation: parse5TokenInfo.ElementLocation
): ExternalComponent {
    return {
        type: 'ExternalComponent',
        name: tagName,
        namespace: HTML_NAMESPACE,
        location: elementSourceLocation(parse5ElmLocation),
        attributes: [],
        properties: [],
        directives: [],
        listeners: [],
        children: [],
    };
}

export function component(
    tagName: string,
    parse5ElmLocation: parse5TokenInfo.ElementLocation
): Component {
    return {
        type: 'Component',
        name: tagName,
        namespace: HTML_NAMESPACE,
        location: elementSourceLocation(parse5ElmLocation),
        attributes: [],
        properties: [],
        directives: [],
        listeners: [],
        children: [],
    };
}

export function lwcComponent(
    tagName: LwcTagName,
    parse5ElmLocation: parse5TokenInfo.ElementLocation
): LwcComponent {
    return {
        type: 'Lwc',
        name: tagName,
        namespace: HTML_NAMESPACE,
        location: elementSourceLocation(parse5ElmLocation),
        attributes: [],
        properties: [],
        directives: [],
        listeners: [],
        children: [],
    };
}

export function slot(slotName: string, parse5ElmLocation: parse5TokenInfo.ElementLocation): Slot {
    return {
        type: 'Slot',
        name: 'slot',
        namespace: HTML_NAMESPACE,
        slotName,
        location: elementSourceLocation(parse5ElmLocation),
        attributes: [],
        properties: [],
        directives: [],
        listeners: [],
        children: [],
    };
}

export function text(
    raw: string,
    // TODO [#3370]: remove experimental template expression flag
    value: Literal | Expression | ComplexExpression,
    parse5Location: parse5TokenInfo.Location
): Text {
    return {
        type: 'Text',
        raw,
        value,
        location: sourceLocation(parse5Location),
    };
}

export function comment(
    raw: string,
    value: string,
    parse5Location: parse5TokenInfo.Location
): Comment {
    return {
        type: 'Comment',
        raw,
        value,
        location: sourceLocation(parse5Location),
    };
}

export function elementSourceLocation(
    parse5ElmLocation: parse5TokenInfo.ElementLocation
): ElementSourceLocation {
    const elementLocation = sourceLocation(parse5ElmLocation);
    const startTag = sourceLocation(parse5ElmLocation.startTag!);
    // endTag must be optional because Parse5 currently fails to collect end tag location for element with a tag name
    // containing an upper case character (inikulin/parse5#352).
    const endTag = parse5ElmLocation.endTag
        ? sourceLocation(parse5ElmLocation.endTag)
        : parse5ElmLocation.endTag;

    return { ...elementLocation, startTag, endTag: endTag! };
}

export function sourceLocation(location: parse5TokenInfo.Location): SourceLocation {
    return {
        startLine: location.startLine,
        startColumn: location.startCol,
        endLine: location.endLine,
        endColumn: location.endCol,
        start: location.startOffset,
        end: location.endOffset,
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
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation,
    item: Identifier,
    index?: Identifier
): ForEach {
    return {
        type: 'ForEach',
        expression,
        item,
        index,
        location: elementLocation,
        directiveLocation,
        children: [],
    };
}

export function forOf(
    expression: Expression,
    iterator: Identifier,
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation
): ForOf {
    return {
        type: 'ForOf',
        expression,
        iterator,
        location: elementLocation,
        directiveLocation,
        children: [],
    };
}

export function scopedSlotFragment(
    identifier: Identifier,
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation,
    slotName: Literal | Expression
): ScopedSlotFragment {
    return {
        type: 'ScopedSlotFragment',
        location: elementLocation,
        directiveLocation,
        children: [],
        slotData: slotDataDirective(identifier, directiveLocation),
        slotName: slotName,
    };
}

export function ifNode(
    modifier: string,
    condition: Expression,
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation
): If {
    return {
        type: 'If',
        modifier,
        condition,
        location: elementLocation,
        directiveLocation,
        children: [],
    };
}

export function ifBlockNode(
    condition: Expression,
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation
): IfBlock {
    return {
        type: 'IfBlock',
        condition,
        location: elementLocation,
        directiveLocation,
        children: [],
    };
}

export function elseifBlockNode(
    condition: Expression,
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation
): ElseifBlock {
    return {
        type: 'ElseifBlock',
        condition,
        location: elementLocation,
        directiveLocation,
        children: [],
    };
}

export function elseBlockNode(
    elementLocation: SourceLocation,
    directiveLocation: SourceLocation
): ElseBlock {
    return {
        type: 'ElseBlock',
        location: elementLocation,
        directiveLocation,
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

export function lwcIsDirective(value: Expression, location: SourceLocation): IsDirective {
    return {
        type: 'Directive',
        name: 'Is',
        value,
        location,
    };
}

export function spreadDirective(value: Expression, location: SourceLocation): SpreadDirective {
    return {
        type: 'Directive',
        name: 'Spread',
        value,
        location,
    };
}

export function slotBindDirective(value: Expression, location: SourceLocation): SlotBindDirective {
    return {
        type: 'Directive',
        name: 'SlotBind',
        value,
        location,
    };
}

export function slotDataDirective(value: Identifier, location: SourceLocation): SlotDataDirective {
    return {
        type: 'Directive',
        name: 'SlotData',
        value,
        location,
    };
}

export function domDirective(
    lwcDomAttr: LWCDirectiveDomMode,
    location: SourceLocation
): DomDirective {
    return {
        type: 'Directive',
        name: 'Dom',
        value: literal(lwcDomAttr),
        location,
    };
}

export function innerHTMLDirective(
    value: Expression | Literal<string>,
    location: SourceLocation
): InnerHTMLDirective {
    return {
        type: 'Directive',
        name: 'InnerHTML',
        value,
        location,
    };
}

export function refDirective(value: Literal<string>, location: SourceLocation): RefDirective {
    return {
        type: 'Directive',
        name: 'Ref',
        value,
        location,
    };
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

export function renderModeDirective(
    renderMode: LWCDirectiveRenderMode,
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
    attributeName: string,
    value: Expression | Literal,
    location: SourceLocation
): Property {
    return {
        type: 'Property',
        name,
        attributeName,
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

export function isExternalComponent(node: BaseNode): node is ExternalComponent {
    return node.type === 'ExternalComponent';
}

export function isComponent(node: BaseNode): node is Component {
    return node.type === 'Component';
}

export function isSlot(node: BaseNode): node is Slot {
    return node.type === 'Slot';
}

export function isBaseElement(node: BaseNode): node is BaseElement {
    return (
        isElement(node) ||
        isComponent(node) ||
        isSlot(node) ||
        isExternalComponent(node) ||
        isLwcComponent(node)
    );
}

// BaseLwcElement represents special LWC tags denoted lwc:*
export function isBaseLwcElement(node: BaseNode): node is BaseLwcElement<LwcTagName> {
    return node.type === 'Lwc';
}

// Represents the lwc:component tag
export function isLwcComponent(node: BaseNode): node is LwcComponent {
    return isBaseLwcElement(node) && node.name === 'lwc:component';
}

export function isText(node: BaseNode): node is Text {
    return node.type === 'Text';
}

export function isComment(node: BaseNode): node is Comment {
    return node.type === 'Comment';
}

export function isExpression(node: BaseNode | Literal): node is Expression {
    return node.type !== 'Literal';
}

export function isStringLiteral(
    node: Expression | Literal | ComplexExpression
): node is Literal<string> {
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

export function isIf(node: BaseNode): node is If {
    return node.type === 'If';
}

export function isIfBlock(node: BaseNode): node is IfBlock {
    return node.type === 'IfBlock';
}

export function isElseifBlock(node: BaseNode): node is ElseifBlock {
    return node.type === 'ElseifBlock';
}

export function isElseBlock(node: BaseNode): node is ElseBlock {
    return node.type === 'ElseBlock';
}

export function isConditionalParentBlock(node: BaseNode): node is IfBlock | ElseifBlock {
    return isIfBlock(node) || isElseifBlock(node);
}

export function isConditionalBlock(node: BaseNode): node is IfBlock | ElseifBlock | ElseBlock {
    return isIfBlock(node) || isElseifBlock(node) || isElseBlock(node);
}

export function isElementDirective(
    node: BaseNode
): node is IfBlock | ElseifBlock | ElseBlock | ForBlock | If | ScopedSlotFragment {
    return isConditionalBlock(node) || isForBlock(node) || isIf(node) || isScopedSlotFragment(node);
}

export function isParentNode(node: BaseNode): node is ParentNode {
    return isBaseElement(node) || isRoot(node) || isForBlock(node) || isIf(node);
}

export function isDynamicDirective(directive: ElementDirective): directive is DynamicDirective {
    return directive.name === 'Dynamic';
}

export function isLwcIsDirective(directive: ElementDirective): directive is IsDirective {
    return directive.name === 'Is';
}

export function isDomDirective(directive: ElementDirective): directive is DomDirective {
    return directive.name === 'Dom';
}

export function isSpreadDirective(directive: ElementDirective): directive is SpreadDirective {
    return directive.name === 'Spread';
}

export function isInnerHTMLDirective(directive: ElementDirective): directive is InnerHTMLDirective {
    return directive.name === 'InnerHTML';
}

export function isRefDirective(directive: ElementDirective): directive is RefDirective {
    return directive.name === 'Ref';
}

export function isKeyDirective(directive: ElementDirective): directive is KeyDirective {
    return directive.name === 'Key';
}

export function isSlotDataDirective(directive: ElementDirective): directive is SlotDataDirective {
    return directive.name === 'SlotData';
}

export function isSlotBindDirective(directive: ElementDirective): directive is SlotBindDirective {
    return directive.name === 'SlotBind';
}

export function isRenderModeDirective(directive: RootDirective): directive is RenderModeDirective {
    return directive.name === 'RenderMode';
}

export function isPreserveCommentsDirective(
    directive: RootDirective
): directive is PreserveCommentsDirective {
    return directive.name === 'PreserveComments';
}

export function isProperty(node: BaseNode): node is Property {
    return node.type === 'Property';
}

export function isScopedSlotFragment(node: BaseNode): node is ScopedSlotFragment {
    return node.type === 'ScopedSlotFragment';
}
