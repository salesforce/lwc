/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerError,
    normalizeToCompilerError,
    normalizeToDiagnostic,
    DiagnosticLevel,
    TransformerErrors,
} from '@lwc/errors';
import { compile } from '@lwc/template-compiler';

import type { NormalizedTransformOptions } from '../options';
import type { TransformResult } from './shared';

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 * @param src HTML source
 * @param filename Source filename, with extension.
 * @param options Transformation options
 * @returns Transformed code, source map, and metadata
 * @throws Compiler errors, when compilation fails.
 * @example
 */
export default function templateTransform(
    src: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const {
        experimentalDynamicComponent,
        // TODO [#3370]: remove experimental template expression flag
        experimentalComplexExpressions,
        preserveHtmlComments,
        enableStaticContentOptimization,
        customRendererConfig,
        enableDynamicComponents,
        experimentalDynamicDirective: deprecatedDynamicDirective,
        enableLwcOn,
        instrumentation,
        namespace,
        name,
        apiVersion,
        disableSyntheticShadowSupport,
        collectMultipleErrors,
    } = options;
    const experimentalDynamicDirective =
        deprecatedDynamicDirective ?? Boolean(experimentalDynamicComponent);

    let result;
    try {
        result = compile(src, filename, {
            name,
            namespace,
            experimentalDynamicDirective,
            // TODO [#3370]: remove experimental template expression flag
            experimentalComplexExpressions,
            preserveHtmlComments,
            enableStaticContentOptimization,
            customRendererConfig,
            enableDynamicComponents,
            enableLwcOn,
            instrumentation,
            apiVersion,
            disableSyntheticShadowSupport,
            collectMultipleErrors,
        });
    } catch (e) {
        if (collectMultipleErrors) {
            // Convert compilation error to diagnostic and continue
            const diagnostic = normalizeToDiagnostic(TransformerErrors.HTML_TRANSFORMER_ERROR, e, {
                filename,
            });
            return {
                code: '',
                map: { mappings: '' },
                errors: [diagnostic],
                fatal: true,
            };
        } else {
            throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, {
                filename,
            });
        }
    }

    // Separate errors from warnings
    const errors = result.warnings.filter((warning) => warning.level === DiagnosticLevel.Error);
    const warnings = result.warnings.filter((warning) => warning.level === DiagnosticLevel.Warning);

    if (collectMultipleErrors) {
        // Collect all errors instead of throwing
        return {
            code: result.code,
            map: { mappings: '' },
            errors: errors.length > 0 ? errors : undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            fatal: errors.length > 0,
            cssScopeTokens: result.cssScopeTokens,
        };
    } else {
        // Original behavior - throw on first error
        if (errors.length > 0) {
            throw CompilerError.from(errors[0], { filename });
        }

        return {
            code: result.code,
            map: { mappings: '' },
            warnings,
            cssScopeTokens: result.cssScopeTokens,
        };
    }
}
