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
} from '@lwc/errors';
import { compile } from '@lwc/template-compiler';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';

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
        instrumentation,
        namespace,
        name,
        apiVersion,
        disableSyntheticShadowSupport,
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
            instrumentation,
            apiVersion,
            disableSyntheticShadowSupport,
        });
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    const fatalError = result.warnings.find((warning) => warning.level === DiagnosticLevel.Error);
    if (fatalError) {
        throw CompilerError.from(fatalError, { filename });
    }

    // The "Error" diagnostic level makes no sense to include here, because it would already have been
    // thrown above. As for "Log" and "Fatal", they are currently unused.
    const warnings = result.warnings.filter((_) => _.level === DiagnosticLevel.Warning);

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: result.code,
        map: { mappings: '' },
        warnings,
        cssScopeTokens: result.cssScopeTokens,
    };
}
