/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { LwcBabelPluginOptions } from '@lwc/babel-plugin-component';
import type { Config as TemplateCompilerConfig } from '@lwc/template-compiler';

export type Expression = string;

export type TemplateTransformOptions = Pick<TemplateCompilerConfig, 'name' | 'namespace'>;
export type ComponentTransformOptions = Partial<
    Pick<LwcBabelPluginOptions, 'name' | 'namespace'>
> & {
    // TODO [#5031]: Unify dynamicImports and experimentalDynamicComponent options
    experimentalDynamicComponent?: LwcBabelPluginOptions['dynamicImports'];
};
