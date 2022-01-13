/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { CompilerDiagnostic } from '@lwc/errors';

export type TemplateIdentifier = { type: 'Identifier'; name: string };
export type TemplateExpression =
    | {
          type: 'MemberExpression';
          object: TemplateExpression;
          property: TemplateExpression;
          computed: boolean;
          optional: boolean;
      }
    | { type: 'Literal'; value: string | number | boolean | null }
    | TemplateIdentifier;

export type TemplateCompileResult = {
    code: string;
    warnings: CompilerDiagnostic[];
};

export type TemplateParseResult = {
    root?: IRElement | undefined;
    warnings: CompilerDiagnostic[];
};

export interface ForEach {
    expression: TemplateExpression;
    item: TemplateIdentifier;
    index?: TemplateIdentifier;
}

export interface ForIterator {
    expression: TemplateExpression;
    iterator: TemplateIdentifier;
}

export enum LWCDirectiveDomMode {
    manual = 'manual',
}

export enum LWCDirectiveRenderMode {
    shadow = 'shadow',
    light = 'light',
}

export interface LWCDirectiveDynamic {
    prop: string;
}

export interface LWCDirectives {
    dom?: LWCDirectiveDomMode;
    dynamic?: TemplateExpression;
    renderMode?: LWCDirectiveRenderMode;
    preserveComments?: IRBooleanAttribute;
    innerHTML?: TemplateExpression | string;
}

export interface IRBaseNode<N extends parse5.Node> {
    type: string;
    location: parse5.Location;

    // TODO [#2432]: Remove `__original` property on the `IRBaseNode`.
    __original?: N;
}

export interface IRElement extends IRBaseNode<parse5.Element> {
    type: 'element';
    tag: string;
    namespace: string;
    children: IRNode[];
    location: parse5.ElementLocation;

    component?: string;

    on?: { [name: string]: TemplateExpression };
    attrs?: { [name: string]: IRAttribute };
    props?: { [name: string]: IRAttribute };

    if?: TemplateExpression;
    ifModifier?: string;

    forEach?: ForEach;
    forOf?: ForIterator;
    forKey?: TemplateExpression;

    lwc?: LWCDirectives;

    slotName?: string;
}

export interface IRText extends IRBaseNode<parse5.TextNode> {
    type: 'text';
    value: string | TemplateExpression;
}

export interface IRComment extends IRBaseNode<parse5.CommentNode> {
    type: 'comment';
    value: string;
}

export type IRNode = IRComment | IRElement | IRText;

export enum IRAttributeType {
    Expression,
    String,
    Boolean,
}

export interface IRBaseAttribute {
    name: string;
    location: parse5.Location;
    type: IRAttributeType;
}

export interface IRExpressionAttribute extends IRBaseAttribute {
    type: IRAttributeType.Expression;
    value: TemplateExpression;
}

export interface IRStringAttribute extends IRBaseAttribute {
    type: IRAttributeType.String;
    value: string;
}

export interface IRBooleanAttribute extends IRBaseAttribute {
    type: IRAttributeType.Boolean;
    value: true;
}

export type IRAttribute = IRStringAttribute | IRExpressionAttribute | IRBooleanAttribute;
