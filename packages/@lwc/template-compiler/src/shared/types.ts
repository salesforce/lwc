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
    root?: Root;
    warnings: CompilerDiagnostic[];
};

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
    endTag?: SourceLocation;
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
    value: Literal | Expression;
}

export interface EventListener extends BaseNode {
    type: 'EventListener';
    name: string;
    handler: Expression;
}

export interface Directive extends BaseNode {
    type: 'Directive';
    name: string;
    value: Expression | Literal;
}

export interface KeyDirective extends Directive {
    name: 'Key';
    value: Expression;
}

export interface DynamicDirective extends Directive {
    name: 'Dynamic';
    value: Expression;
}

export interface DomDirective extends Directive {
    name: 'Dom';
    value: Literal<'manual'>;
}

export interface InnerHTMLDirective extends Directive {
    name: `InnerHTML`;
    value: Expression | Literal<string>;
}

export interface RenderModeDirective extends Directive {
    name: 'RenderMode';
    value: Literal<LWCDirectiveRenderMode>;
}

export interface PreserveCommentsDirective extends Directive {
    name: 'PreserveComments';
    value: Literal<boolean>;
}

export type ElementDirective = KeyDirective | DynamicDirective | DomDirective | InnerHTMLDirective;
export type RootDirective = RenderModeDirective | PreserveCommentsDirective;

export interface Text extends BaseNode {
    type: 'Text';
    value: Literal | Expression;
}

export interface Comment extends BaseNode {
    type: 'Comment';
    value: string;
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
    namespace?: string;
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

interface DirectiveParentNode extends BaseParentNode {
    directiveLocation: SourceLocation;
}

export interface If extends DirectiveParentNode {
    type: 'If';
    modifier: string;
    condition: Expression;
}

export interface ForEach extends DirectiveParentNode {
    type: 'ForEach';
    expression: Expression;
    item: Identifier;
    index?: Identifier;
}

export interface ForOf extends DirectiveParentNode {
    type: 'ForOf';
    expression: Expression;
    iterator: Identifier;
}

export type ForBlock = ForEach | ForOf;

export type ParentNode = Root | ForBlock | If | BaseElement;

export type ChildNode = ForBlock | If | BaseElement | Comment | Text;

export type Node = Root | ForBlock | If | BaseElement | Comment | Text;
