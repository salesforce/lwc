/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Config as TemplateCompilerConfig } from '@lwc/template-compiler';

export type Expression = string;

export type Instruction =
    | IEmitTagName
    | IEmitStaticString
    | IEmitExpression
    | IStartConditional
    | IEndConditional
    | IInvokeConnectedCallback
    | IRenderChild
    | IHoistImport
    | IHoistInstantiation;

export interface IEmitTagName {
    kind: 'emitTagName';
}

export interface IEmitStaticString {
    kind: 'emitStaticString';
}

export interface IEmitExpression {
    kind: 'emitExpression';
    expression: Expression;
}

export interface IStartConditional {
    kind: 'startConditional';
}

export interface IEndConditional {
    kind: 'endConditional';
}

export interface IInvokeConnectedCallback {
    kind: 'invokeConnectedCallback';
}

export interface IRenderChild {
    kind: 'renderChild';
    dynamic: Expression | null;
}

export interface IHoistImport {
    kind: 'hoistImport';
}

export interface IHoistInstantiation {
    kind: 'hoistInstantiation';
}

export type TransformOptions = Pick<TemplateCompilerConfig, 'name' | 'namespace'>;

export type CompilationMode = 'asyncYield' | 'async' | 'sync';
