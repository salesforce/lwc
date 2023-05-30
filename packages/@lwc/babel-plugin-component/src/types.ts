/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as BabelCoreNamespace from '@babel/core';
import { PluginPass, types } from '@babel/core';
import { InstrumentationObject } from '@lwc/errors';

export type BabelAPI = typeof BabelCoreNamespace;
export type BabelTypes = typeof types;

export interface LwcBabelPluginOptions {
    isExplicitImport?: boolean;
    dynamicImports?: {
        loader?: string;
        strictSpecifier?: boolean;
    };
    namespace?: string;
    name?: string;
    instrumentation?: InstrumentationObject;
    apiVersion?: number;
}

export interface LwcBabelPluginPass extends PluginPass {
    opts: LwcBabelPluginOptions;
    dynamicImports?: string[];
    loaderRef?: types.Identifier;
}
