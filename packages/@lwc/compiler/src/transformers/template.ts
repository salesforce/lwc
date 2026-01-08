/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerError,
    normalizeToCompilerError,
    DiagnosticLevel,
    TransformerErrors,
    CompilerAggregateError,
} from '@lwc/errors';
import { compile } from '@lwc/template-compiler';

import type { BabelFileResult } from '@babel/core';
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
        experimentalErrorRecoveryMode,
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
        });
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    const errors = result.warnings.filter((warning) => warning.level === DiagnosticLevel.Error);

    if (experimentalErrorRecoveryMode && errors.length > 0) {
        throw new CompilerAggregateError(
            errors.map((err) => CompilerError.from(err, { filename }))
        );
    }

    if (errors[0]) {
        throw CompilerError.from(errors[0], { filename });
    }

    // The "Error" diagnostic level makes no sense to include here, because it would already have been
    // thrown above. As for "Log" and "Fatal", they are currently unused.
    const warnings = result.warnings.filter((_) => _.level === DiagnosticLevel.Warning);

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: result.code,
        map: { mappings: '' } as BabelFileResult['map'],
        warnings,
        cssScopeTokens: result.cssScopeTokens,
    };
}
