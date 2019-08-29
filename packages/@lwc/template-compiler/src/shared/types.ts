/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babelTypes from '@babel/types';
import * as parse5 from 'parse5-with-errors';
import { CompilerDiagnostic } from '@lwc/errors';

export type TemplateIdentifier = babelTypes.Identifier;
export type TemplateExpression =
    | babelTypes.MemberExpression
    | babelTypes.Literal
    | babelTypes.Identifier;

export type TemplateCompileResult = {
    code: string;
    warnings: CompilerDiagnostic[];
};

export type TemplateParseResult = {
    root?: IRElement | undefined;
    warnings: CompilerDiagnostic[];
};

export type HTMLText = parse5.AST.TextNode;
export type HTMLElement = parse5.AST.Element;
export type HTMLNode = HTMLElement | HTMLText;

export interface SlotDefinition {
    [key: string]: IRNode[];
}

export interface ForEach {
    expression: TemplateExpression;
    item: TemplateIdentifier;
    index?: TemplateIdentifier;
}

export interface Locator {
    id: string;
    context?: TemplateExpression;
}

export interface ForIterator {
    expression: TemplateExpression;
    iterator: TemplateIdentifier;
}

export enum LWCDirectiveDomMode {
    manual = 'manual',
}

export interface LWCDirectiveDynamic {
    prop: string;
}

export interface LWCDirectives {
    dom?: LWCDirectiveDomMode;
    dynamic?: TemplateExpression;
}

export interface IRElement {
    type: 'element';
    tag: string;

    inlineStyles?: string;

    attrsList: parse5.AST.Default.Attribute[];

    parent?: IRElement;
    children: IRNode[];

    __original: HTMLElement;

    component?: string;

    className?: TemplateExpression;
    classMap?: { [name: string]: true };

    on?: { [name: string]: TemplateExpression };

    style?: TemplateExpression;
    styleMap?: { [name: string]: string | number };

    attrs?: { [name: string]: IRAttribute };
    props?: { [name: string]: IRAttribute };

    if?: TemplateExpression;
    ifModifier?: string;

    forEach?: ForEach;
    forOf?: ForIterator;
    forKey?: TemplateExpression;

    lwc?: LWCDirectives;

    slotName?: string;
    slotSet?: SlotDefinition;
}

export interface IRText {
    type: 'text';
    value: string | TemplateExpression;

    parent?: IRElement;

    __original: HTMLText;
}

export type IRNode = IRElement | IRText;

export enum IRAttributeType {
    Expression,
    String,
    Boolean,
}

export interface IRBaseAttribute {
    name: string;
    location: parse5.MarkupData.Location;
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

export type WarningLevel = 'info' | 'warning' | 'error';

export interface CompilationWarning {
    message: string;
    start: number;
    length: number;
    level: WarningLevel;
}

export interface CompilationOptions {
    token: string;
    experimentalComputedMemberExpression?: boolean;
}

export interface CompilationOutput {
    code: string;
    ast: babelTypes.Node;
}
