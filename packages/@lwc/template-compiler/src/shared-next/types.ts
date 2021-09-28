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
    Literal = 'literal',
    Identifier = 'Identifier',
    MemberExpression = 'MemberExpression',
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
    ForEach = 'for-each',
    Iterator = 'iterator',
    Slot = 'slot',
    Root = 'root',
    Dom = 'dom',
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
    type: LWCNodeType.Literal;
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

export interface DomDirective extends Directive {
    name: LWCNodeType.Dom;
    value: Literal<LWCDirectiveDomMode>;
}

export interface RenderModeDirective extends Directive {
    name: LWCNodeType.RenderMode;
    value: Literal<LWCDirectiveRenderMode.Shadow> | Literal<LWCDirectiveRenderMode.Light>;
}

export interface PreserveCommentsDirective extends Directive {
    name: LWCNodeType.PreserveComments;
    value: Literal<boolean>;
}

export type ElementDirective = KeyDirective | DynamicDirective | DomDirective;
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
    name: string;
    children: ChildNode[];
}

// jtu:  come back to this to verify, properties initially only belonged to components
// see if there's a better way to split up the component / element / slot.
// Maybe create a type alias for it.
export interface BaseElement extends BaseParentNode {
    properties: Property[];
    attributes: Attribute[];
    listeners: EventListener[];
    directives?: ElementDirective[];
}

export interface Element extends BaseElement {
    type: LWCNodeType.Element;
    namespace?: string;
}

export interface Component extends BaseElement {
    type: LWCNodeType.Component;
}

export interface Slot extends BaseElement {
    type: LWCNodeType.Slot;
    namespace?: string;
}

export interface IfBlock extends BaseParentNode {
    type: LWCNodeType.IfBlock;
    modifier: string;
    condition: Expression;
}
export interface ForEach extends BaseParentNode {
    type: LWCNodeType.ForEach;
    expression: Expression;
    item?: Identifier;
    index?: Identifier;
}

export interface Iterator extends BaseParentNode {
    type: LWCNodeType.Iterator;
    expression: Expression;
    iterator: Identifier;
}

export type ForBlock = ForEach | Iterator;

export interface Root extends BaseParentNode {
    type: LWCNodeType.Root;
    directives?: RootDirective[];
}

export type ParentNode = ForBlock | IfBlock | Element | Component | Slot | Root;

// jtu:  should slot be a childnode type?
export type ChildNode = ForBlock | IfBlock | Element | Component | Slot | Comment | Text;

export type Node =
    | ForEach
    | Iterator
    | ForBlock
    | IfBlock
    | Element
    | Component
    | Comment
    | Slot
    | Root
    | Text
    | Attribute;

export interface ParentWrapper {
    parent?: ParentWrapper;
    node: ParentNode;
}
