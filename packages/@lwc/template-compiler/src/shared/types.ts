/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompilerDiagnostic } from '@lwc/errors';

export interface TemplateParseResult {
    root?: Root;
    warnings: CompilerDiagnostic[];
}

export interface TemplateCompileResult extends TemplateParseResult {
    code: string;
}

export enum LWCDirectiveDomMode {
    manual = 'manual',
}

export enum LWCDirectiveRenderMode {
    shadow = 'shadow',
    light = 'light',
}

export interface BaseNode {
    type: string;
    location: SourceLocation;
}

export interface SourceLocation {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    start: number;
    end: number;
}

export interface ElementSourceLocation extends SourceLocation {
    startTag: SourceLocation;
    endTag: SourceLocation;
}

export interface Literal<Value = string | boolean> {
    type: 'Literal';
    value: Value;
}

export interface Identifier extends BaseNode {
    type: 'Identifier';
    name: string;
}

export interface MemberExpression extends BaseNode {
    type: 'MemberExpression';
    object: Expression;
    property: Identifier;
}

export type Expression = Identifier | MemberExpression;

export interface Attribute extends BaseNode {
    type: 'Attribute';
    name: string;
    value: Literal | Expression;
}

export interface Property extends BaseNode {
    type: 'Property';
    name: string;
    attributeName: string;
    value: Literal | Expression;
}

export interface EventListener extends BaseNode {
    type: 'EventListener';
    name: string;
    handler: Expression;
}

export interface Directive<
    T extends keyof typeof ElementDirectiveName | keyof typeof RootDirectiveName
> extends BaseNode {
    type: 'Directive';
    name: T;
    value: Expression | Literal;
}

export interface KeyDirective extends Directive<'Key'> {
    value: Expression;
}

export interface DynamicDirective extends Directive<'Dynamic'> {
    value: Expression;
}

export interface DomDirective extends Directive<'Dom'> {
    value: Literal<'manual'>;
}

export interface SpreadDirective extends Directive<'Spread'> {
    value: Expression;
}

export interface InnerHTMLDirective extends Directive<'InnerHTML'> {
    value: Expression | Literal<string>;
}

export interface RenderModeDirective extends Directive<'RenderMode'> {
    value: Literal<LWCDirectiveRenderMode>;
}

export interface PreserveCommentsDirective extends Directive<'PreserveComments'> {
    value: Literal<boolean>;
}

export interface RefDirective extends Directive<'Ref'> {
    value: Literal<string>;
}

export interface SlotBindDirective extends Directive<'SlotBind'> {
    value: Expression;
}

export interface SlotDataDirective extends Directive<'SlotData'> {
    value: Identifier;
}

export type ElementDirective =
    | KeyDirective
    | DynamicDirective
    | DomDirective
    | InnerHTMLDirective
    | RefDirective
    | SlotBindDirective
    | SlotDataDirective
    | SpreadDirective;

export type RootDirective = RenderModeDirective | PreserveCommentsDirective;

export interface Text extends BaseNode {
    type: 'Text';
    value: Literal | Expression;
    raw: string;
}

export interface Comment extends BaseNode {
    type: 'Comment';
    value: string;
    raw: string;
}

export interface BaseParentNode extends BaseNode {
    children: ChildNode[];
}

export interface AbstractBaseElement extends BaseParentNode {
    name: string;
    location: ElementSourceLocation;
    properties: Property[];
    attributes: Attribute[];
    listeners: EventListener[];
    directives: ElementDirective[];
    namespace: string;
}

export interface Element extends AbstractBaseElement {
    type: 'Element';
}

export interface Component extends AbstractBaseElement {
    type: 'Component';
}

export interface Slot extends AbstractBaseElement {
    type: 'Slot';
    /** Specifies slot element name. An empty string value maps to the default slot.  */
    slotName: string;
}

export type BaseElement = Element | Component | Slot;

export interface Root extends BaseParentNode {
    type: 'Root';
    location: ElementSourceLocation;
    directives: RootDirective[];
}

export enum TemplateDirectiveName {
    If = 'if:true',
    IfBlock = 'lwc:if',
    ElseifBlock = 'lwc:elseif',
    ElseBlock = 'lwc:else',
    ForEach = 'for:each',
    ForOf = 'for:of',
    ScopedSlotFragment = 'lwc:slot-data',
}

interface DirectiveParentNode<T extends keyof typeof TemplateDirectiveName> extends BaseParentNode {
    directiveLocation: SourceLocation;
    type: T;
}

/**
 * Node representing the if:true and if:false directives
 */
export interface If extends DirectiveParentNode<'If'> {
    modifier: string;
    condition: Expression;
}

/**
 * Node representing the lwc:if directive
 */
export interface IfBlock extends DirectiveParentNode<'IfBlock'> {
    condition: Expression;
    else?: ElseifBlock | ElseBlock;
}

/**
 * Node representing the lwc:elseif directive
 */
export interface ElseifBlock extends DirectiveParentNode<'ElseifBlock'> {
    condition: Expression;
    else?: ElseifBlock | ElseBlock;
}

/**
 * Node representing the lwc:else directive
 */
export interface ElseBlock extends DirectiveParentNode<'ElseBlock'> {}

export interface ForEach extends DirectiveParentNode<'ForEach'> {
    expression: Expression;
    item: Identifier;
    index?: Identifier;
}

export interface ForOf extends DirectiveParentNode<'ForOf'> {
    expression: Expression;
    iterator: Identifier;
}

/**
 * Node representing lwc:slot-data directive
 */
export interface ScopedSlotFragment extends DirectiveParentNode<'ScopedSlotFragment'> {
    slotData: SlotDataDirective;
    slotName: Literal;
}

export type ForBlock = ForEach | ForOf;

export type ParentNode =
    | Root
    | ForBlock
    | If
    | IfBlock
    | ElseifBlock
    | ElseBlock
    | BaseElement
    | ScopedSlotFragment;

export type ChildNode =
    | ForBlock
    | If
    | IfBlock
    | ElseifBlock
    | ElseBlock
    | BaseElement
    | Comment
    | Text
    | ScopedSlotFragment;

export type Node =
    | Root
    | ForBlock
    | If
    | IfBlock
    | ElseifBlock
    | ElseBlock
    | BaseElement
    | Comment
    | Text
    | ScopedSlotFragment;

export enum ElementDirectiveName {
    Dom = 'lwc:dom',
    Dynamic = 'lwc:dynamic',
    InnerHTML = 'lwc:inner-html',
    Ref = 'lwc:ref',
    SlotBind = 'lwc:slot-bind',
    SlotData = 'lwc:slot-data',
    Spread = 'lwc:spread',
    Key = 'key',
}

export enum RootDirectiveName {
    PreserveComments = 'lwc:preserve-comments',
    RenderMode = 'lwc:render-mode',
}
