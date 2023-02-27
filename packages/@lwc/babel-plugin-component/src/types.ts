/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as BabelCoreNamespace from '@babel/core';
import * as BabelTypesNamespace from '@babel/types';
import { PluginPass, types } from '@babel/core';

export type BabelAPI = typeof BabelCoreNamespace;
export type BabelTypes = typeof BabelTypesNamespace;

export interface LwcBabelPluginPass extends PluginPass {
    opts: {
        isExplicitImport?: boolean;
        dynamicImports?: {
            loader?: string;
            strictSpecifier?: boolean;
        };
    };
    dynamicImports?: string[];
    loaderRef?: types.Identifier;
}
