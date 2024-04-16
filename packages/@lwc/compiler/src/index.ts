/*
 * Copyright (c) 2024, Salesforce, Inc.
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

/** The version of LWC being used. */
export const version = process.env.LWC_VERSION!;
