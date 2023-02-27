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

// Copied from @babel/traverse's Binding type
export type BindingOptions = {
    id: t.LVal;
    init?: t.Expression | undefined;
    unique?: boolean | undefined;
    kind?: 'var' | 'let' | 'const' | undefined;
};
