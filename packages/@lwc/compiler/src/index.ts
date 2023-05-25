/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export { transform, transformSync } from './transformers/transformer';

export { TransformResult } from './transformers/transformer';
export {
    TransformOptions,
    StylesheetConfig,
    CustomPropertiesResolution,
    DynamicImportConfig,
    OutputConfig,
} from './options';

export const version = process.env.LWC_VERSION as string;
