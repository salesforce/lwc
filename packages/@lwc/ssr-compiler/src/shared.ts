/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { reservedKeywords } from '@lwc/shared';
import type { Config as TemplateCompilerConfig } from '@lwc/template-compiler';

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

/* SSR compilation mode. `async` refers to async functions, `sync` to sync functions, and `asyncYield` to async generator functions. */
export type CompilationMode = 'asyncYield' | 'async' | 'sync';

// This is a mostly-correct regular expression will only match if the entire string
// provided is a valid ECMAScript identifier. Its imperfections lie in the fact that
// it will match strings like "export" when "export" is actually a reserved keyword
// and therefore not a valid identifier. When combined with a check against reserved
// keywords, it is a reliable test for whether a provided string is a valid identifier.
const imperfectIdentifierMatcher = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

export const isValidIdentifier = (str: string) =>
    !reservedKeywords.has(str) && imperfectIdentifierMatcher.test(str);
