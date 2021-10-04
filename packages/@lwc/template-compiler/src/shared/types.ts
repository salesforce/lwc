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

export enum LWCDirectiveDomMode {
    manual = 'manual',
}

export enum LWCNodeType {
    Literal = 'Literal',
    Identifier = 'Identifier',
    MemberExpression = 'MemberExpression',
    Attribute = 'Attribute',
    Property = 'Property',
    EventListener = 'EventListener',
    Directive = 'Directive',
    Key = 'Key',
    Dynamic = 'Dynamic',
    RenderMode = 'RenderMode',
    PreserveComments = 'PreserveComments',
    Text = 'Text',
    Comment = 'Comment',
    Element = 'Element',
    Component = 'Component',
    IfBlock = 'IfBlock',
    ForBlock = 'ForBlock',
    ForEach = 'ForEach',
    ForOf = 'ForOf',
    Slot = 'Slot',
    Root = 'Root',
    Dom = 'Dom',
}

export enum LWCDirectiveRenderMode {
    Shadow = 'shadow',
    Light = 'light',
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

export interface Literal<Value = string | boolean> {
    type: `${LWCNodeType.Literal}`;
    value: Value;
}

export interface Identifier extends BaseNode {
    type: `${LWCNodeType.Identifier}`;
    name: string;
}

export interface MemberExpression extends BaseNode {
    type: `${LWCNodeType.MemberExpression}`;
    object: Expression;
    property: Identifier;
}

export type Expression = Identifier | MemberExpression;

export interface Attribute extends BaseNode {
    type: `${LWCNodeType.Attribute}`;
    name: string;
    value: Literal | Expression;
}

export interface Property extends BaseNode {
    type: `${LWCNodeType.Property}`;
    name: string;
    value: Literal | Expression;
}

export interface EventListener extends BaseNode {
    type: `${LWCNodeType.EventListener}`;
    name: string;
    handler: Expression;
}

export interface Directive extends BaseNode {
    type: `${LWCNodeType.Directive}`;
    name: string;
    value: Expression | Literal;
}

export interface KeyDirective extends Directive {
    name: `${LWCNodeType.Key}`;
    value: Expression;
}

export interface DynamicDirective extends Directive {
    name: `${LWCNodeType.Dynamic}`;
    value: Expression;
}

export interface DomDirective extends Directive {
    name: `${LWCNodeType.Dom}`;
    value: Literal<LWCDirectiveDomMode>;
}

export interface RenderModeDirective extends Directive {
    name: `${LWCNodeType.RenderMode}`;
    value: Literal<LWCDirectiveRenderMode.Shadow> | Literal<LWCDirectiveRenderMode.Light>;
}

export interface PreserveCommentsDirective extends Directive {
    name: `${LWCNodeType.PreserveComments}`;
    value: Literal<boolean>;
}

export type ElementDirective = KeyDirective | DynamicDirective | DomDirective;
export type RootDirective = RenderModeDirective | PreserveCommentsDirective;

export interface Text extends BaseNode {
    type: `${LWCNodeType.Text}`;
    value: Literal | Expression;
}

export interface Comment extends BaseNode {
    type: `${LWCNodeType.Comment}`;
    value: string;
}

export interface BaseParentNode extends BaseNode {
    name: string;
    children: ChildNode[];
}

export interface BaseElement extends BaseParentNode {
    properties: Property[];
    attributes: Attribute[];
    listeners: EventListener[];
    directives?: ElementDirective[];
    namespace?: string;
}

export interface Element extends BaseElement {
    type: `${LWCNodeType.Element}`;
}

export interface Component extends BaseElement {
    type: `${LWCNodeType.Component}`;
}

export interface Slot extends BaseElement {
    type: `${LWCNodeType.Slot}`;
}

export interface IfBlock extends BaseParentNode {
    type: `${LWCNodeType.IfBlock}`;
    modifier: string;
    condition: Expression;
}

export interface ForEach extends BaseParentNode {
    type: `${LWCNodeType.ForEach}`;
    expression: Expression;
    item: Identifier;
    index?: Identifier;
}

export interface ForOf extends BaseParentNode {
    type: `${LWCNodeType.ForOf}`;
    expression: Expression;
    iterator: Identifier;
}

export type ForBlock = ForEach | ForOf;

export interface Root extends BaseParentNode {
    type: `${LWCNodeType.Root}`;
    directives?: RootDirective[];
}

export type DirectiveNode = Root | Component | Element | Slot;

export type ParentNode = ForBlock | IfBlock | Element | Component | Slot | Root;

export type ChildNode = ForBlock | IfBlock | Element | Component | Slot | Comment | Text;

export interface ParentWrapper {
    parent?: ParentWrapper;
    node: ParentNode;
}
