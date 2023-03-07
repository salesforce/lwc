/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { NodePath } from '@babel/traverse';
import { types } from '@babel/core';
import { LWCErrorInfo } from '@lwc/errors';
import * as t from '@babel/types';

export type ImportSpecifier = {
    name: string;
    path: NodePath<
        types.ImportDefaultSpecifier | types.ImportNamespaceSpecifier | types.ImportSpecifier
    >;
};

export type DecoratorErrorOptions = {
    errorInfo: LWCErrorInfo;
    messageArgs?: any[];
};

// Copied from:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a767e24/types/babel__traverse/index.d.ts#L143-L148
export type BindingOptions = {
    id: t.LVal;
    init?: t.Expression | undefined;
    unique?: boolean | undefined;
    kind?: 'var' | 'let' | 'const' | undefined;
};

export type ClassBodyItem =
    | types.ClassMethod
    | types.ClassPrivateMethod
    | types.ClassProperty
    | types.ClassPrivateProperty
    | types.ClassAccessorProperty
    | types.StaticBlock;

export type LwcDecoratorName = 'api' | 'track' | 'wire';
