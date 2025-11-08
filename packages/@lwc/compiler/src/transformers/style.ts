/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as styleCompiler from '@lwc/style-compiler';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import type { NormalizedTransformOptions } from '../options';
import type { TransformResult } from './shared';

/**
 * Transform the passed source code
 * @param src The source to be transformed. Can be the content of a JavaScript, HTML, or CSS file.
 * @param filename The source filename, with extension.
 * @param config The transformation options. The `name` and the `namespace` of the component is the
 * minimum required for transformation.
 * @returns An object with the generated code, source map and gathered metadata.
 * @throws Compilation errors
 */
export default function styleTransform(
    src: string,
    filename: string,
    config: NormalizedTransformOptions
): TransformResult {
    const { customProperties } = config.stylesheetConfig;
    const { experimentalErrorRecoveryMode } = config;

    const styleCompilerConfig = {
        customProperties: {
            resolverModule:
                customProperties.resolution.type === 'module'
                    ? customProperties.resolution.name
                    : undefined,
        },
        scoped: config.scopedStyles,
        disableSyntheticShadowSupport: config.disableSyntheticShadowSupport,
        apiVersion: config.apiVersion,
        experimentalErrorRecoveryMode,
    };

    let res;
    try {
        res = styleCompiler.transform(src, filename, styleCompilerConfig);
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.CSS_TRANSFORMER_ERROR, e, { filename });
    }

    // In error recovery mode, check for collected errors
    // For now, we just store the errors. Later we'll convert them to CompilerDiagnostic
    // and throw CompilerAggregateError
    if (
        experimentalErrorRecoveryMode &&
        'errors' in res &&
        Array.isArray(res.errors) &&
        res.errors.length > 0
    ) {
        // Errors are collected but not yet converted to diagnostics
        // This will be handled in a future step
    }

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the styles doesn't make sense, the transform returns an empty mappings.
    return {
        code: res.code,
        map: { mappings: '' },
    };
}
