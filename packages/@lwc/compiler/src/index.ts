/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export { compile } from './compiler/compiler';
export { transform, transformSync } from './transformers/transformer';

export { CompileOutput, CompileResult } from './compiler/compiler';
export { TransformResult } from './transformers/transformer';
export {
    CompileOptions,
    TransformOptions,
    StylesheetConfig,
    CustomPropertiesResolution,
    DynamicComponentConfig,
    OutputConfig,
} from './options';

export const version = '__VERSION__';
