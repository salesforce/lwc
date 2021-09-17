/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CompilerDiagnostic } from '@lwc/errors';

export type TemplateCompileResult = {
    code: string;
    warnings: CompilerDiagnostic[];
};

export type TemplateParseResult = {
    root?: Root | undefined;
    warnings: CompilerDiagnostic[];
};

export enum LWCNodeType {
    Literal = 'literal',
    Identifier = 'identifier',
    MemberExpression = 'member-expression',
    Attribute = 'attribute',
    Property = 'property',
    EventListener = 'event-listener',
    Directive = 'directive',
    Key = 'key',
    Dynamic = 'dynamic',
    RenderMode = 'render-mode',
    PreserveComments = 'preserve-comments',
    Text = 'text',
    Comment = 'comment',
    Element = 'element',
    Component = 'component',
    IfBlock = 'if-block',
    ForBlock = 'for-block',
    Slot = 'slot',
    Root = 'root',
}

export enum LWCDirectiveRenderMode {
    Shadow = 'shadow',
    Light = 'light',
}

export enum LWCIfBlockModifier {
    True = 'true',
    False = 'false',
}

export interface BaseNode {
    type: string;
    loc: SourceLocation;
}

export interface SourceLocation {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    start: number;
    end: number;
}

export interface Literal<Value = string | boolean> {
    type: LWCNodeType.Literal;
    value: Value;
}

export interface Identifier extends BaseNode {
    type: LWCNodeType.Identifier;
    name: string;
}

export interface MemberExpression extends BaseNode {
    type: LWCNodeType.MemberExpression;
    object: Expression;
    property: Identifier;
}

export type Expression = Identifier | MemberExpression;

export interface Attribute extends BaseNode {
    type: LWCNodeType.Attribute;
    name: string;
    value: Literal | Expression;
}

export interface Property extends BaseNode {
    type: LWCNodeType.Property;
    name: string;
    value: Literal | Expression;
}

export interface EventListener extends BaseNode {
    type: LWCNodeType.EventListener;
    name: string;
    handler: Expression;
}

export interface Directive extends BaseNode {
    type: LWCNodeType.Directive;
    name: string;
    value: Expression | Literal;
}

export interface KeyDirective extends Directive {
    name: LWCNodeType.Key;
    value: Expression;
}

export interface DynamicDirective extends Directive {
    name: LWCNodeType.Dynamic;
    value: Expression;
}

export interface RenderModeDirective extends Directive {
    name: LWCNodeType.RenderMode;
    value: Literal<LWCDirectiveRenderMode.Shadow> | Literal<LWCDirectiveRenderMode.Light>;
}

export interface PreserveCommentsDirective extends Directive {
    name: LWCNodeType.PreserveComments;
    value: Literal<boolean>;
}

export type ElementDirective = KeyDirective | DynamicDirective;
export type RootDirective = RenderModeDirective | PreserveCommentsDirective;

export interface Text extends BaseNode {
    type: LWCNodeType.Text;
    value: Literal | Expression;
}

export interface Comment extends BaseNode {
    type: LWCNodeType.Comment;
    value: string;
}

export interface BaseParentNode extends BaseNode {
    children: ChildNode[];
}

export interface Element extends BaseParentNode {
    type: LWCNodeType.Element;
    name: string;
    namespace?: string;
    attributes: Attribute[];
    listeners: EventListener[];
    directives?: ElementDirective[];
}

export interface Component extends BaseParentNode {
    type: LWCNodeType.Component;
    name: string;
    attributes: Attribute[];
    properties: Property[];
    listeners: EventListener[];
    directives?: ElementDirective[];
}

export interface IfBlock extends BaseParentNode {
    type: LWCNodeType.IfBlock;
    modifier: LWCIfBlockModifier.True | LWCIfBlockModifier.False;
    condition: Expression;
}

export interface ForBlock extends BaseParentNode {
    type: LWCNodeType.ForBlock;
    expression: Expression;
    item?: Identifier;
    index?: Identifier;
}

export interface Slot extends Omit<Element, 'type'> {
    type: LWCNodeType.Slot;
    name: string;
}

export interface Root extends BaseParentNode {
    type: LWCNodeType.Root;
    directives?: RootDirective[];
}

export type ParentNode = ForBlock | IfBlock | Element | Component | Root;

export type ChildNode = ForBlock | IfBlock | Element | Component | Comment | Text;
