/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { CompilerDiagnostic } from '@lwc/errors';
import type { Node as AcornNode } from 'acorn';

export interface TemplateParseResult {
    root?: Root;
    warnings: CompilerDiagnostic[];
}

export interface TemplateCompileResult extends TemplateParseResult {
    code: string;
    cssScopeTokens: string[];
}

export const LWCDirectiveDomMode = {
    manual: 'manual',
} as const;
export type LWCDirectiveDomMode = (typeof LWCDirectiveDomMode)[keyof typeof LWCDirectiveDomMode];

export const LWCDirectiveRenderMode = {
    shadow: 'shadow',
    light: 'light',
} as const;
export type LWCDirectiveRenderMode =
    (typeof LWCDirectiveRenderMode)[keyof typeof LWCDirectiveRenderMode];

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

// TODO [#3370]: when the template expression flag is removed, the
// ComplexExpression type should be redefined as an ESTree Node. Doing
// so when the flag is still in place results in a cascade of required
// type changes across the codebase.
export type ComplexExpression = AcornNode & { value?: any };

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
    T extends keyof typeof ElementDirectiveName | keyof typeof RootDirectiveName,
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

export interface IsDirective extends Directive<'Is'> {
    value: Expression;
}

export interface DomDirective extends Directive<'Dom'> {
    value: Literal<'manual'>;
}

export interface SpreadDirective extends Directive<'Spread'> {
    value: Expression;
}

export interface OnDirective extends Directive<'On'> {
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
    | IsDirective
    | DomDirective
    | InnerHTMLDirective
    | RefDirective
    | SlotBindDirective
    | SlotDataDirective
    | SpreadDirective
    | OnDirective;

export type RootDirective = RenderModeDirective | PreserveCommentsDirective;

export interface Text extends BaseNode {
    type: 'Text';
    // TODO [#3370]: remove experimental template expression flag
    value: Literal | Expression | ComplexExpression;
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

export interface StaticElement extends Element {
    children: StaticChildNode[];
}

export type StaticChildNode = StaticElement | Text | Comment;

export interface ExternalComponent extends AbstractBaseElement {
    type: 'ExternalComponent';
}

export interface Component extends AbstractBaseElement {
    type: 'Component';
}

export interface Slot extends AbstractBaseElement {
    type: 'Slot';
    /** Specifies slot element name. An empty string value maps to the default slot.  */
    slotName: string;
}

// Special LWC tag names denoted with lwc:*
export interface BaseLwcElement<T extends `${LwcTagName}`> extends AbstractBaseElement {
    type: 'Lwc';
    name: T;
}

/**
 * Node representing the lwc:component element
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LwcComponent extends BaseLwcElement<'lwc:component'> {}

/**
 * All supported special LWC tags, they should all begin with lwc:*
 */
export const LwcTagName = {
    Component: 'lwc:component',
} as const;
export type LwcTagName = (typeof LwcTagName)[keyof typeof LwcTagName];

export type BaseElement = Element | ExternalComponent | Component | Slot | LwcComponent;

export interface Root extends BaseParentNode {
    type: 'Root';
    location: ElementSourceLocation;
    directives: RootDirective[];
}

export const TemplateDirectiveName = {
    If: 'if:true',
    IfBlock: 'lwc:if',
    ElseifBlock: 'lwc:elseif',
    ElseBlock: 'lwc:else',
    ForEach: 'for:each',
    ForOf: 'for:of',
    ScopedSlotFragment: 'lwc:slot-data',
} as const;

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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
    slotName: Literal | Expression;
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

export const ElementDirectiveName = {
    Dom: 'lwc:dom',
    // TODO [#3331]: remove usage of lwc:dynamic in 246
    Dynamic: 'lwc:dynamic',
    Is: 'lwc:is',
    External: 'lwc:external',
    InnerHTML: 'lwc:inner-html',
    Ref: 'lwc:ref',
    SlotBind: 'lwc:slot-bind',
    SlotData: 'lwc:slot-data',
    Spread: 'lwc:spread',
    On: 'lwc:on',
    Key: 'key',
} as const;

export const RootDirectiveName = {
    PreserveComments: 'lwc:preserve-comments',
    RenderMode: 'lwc:render-mode',
} as const;
