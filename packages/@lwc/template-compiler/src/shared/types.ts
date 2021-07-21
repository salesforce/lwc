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
}

export interface IRBaseNode {
    type: string;
    parent?: IRElement;
    location: parse5.Location;
    __original: parse5.Node;
}

export interface IRElement extends IRBaseNode {
    type: 'element';
    tag: string;
    namespace: string;
    children: IRNode[];

    __original: parse5.Element;
    __attrsList: parse5.Attribute[];
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

export interface IRText extends IRBaseNode {
    type: 'text';
    value: string | TemplateExpression;
    __original: parse5.TextNode;
}

export interface IRComment extends IRBaseNode {
    type: 'comment';
    value: string;
    __original: parse5.CommentNode;
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
