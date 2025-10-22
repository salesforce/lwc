/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import babelAsyncGeneratorFunctionsPlugin from '@babel/plugin-transform-async-generator-functions';
import babelAsyncToGenPlugin from '@babel/plugin-transform-async-to-generator';
import babelClassPropertiesPlugin from '@babel/plugin-transform-class-properties';
import babelObjectRestSpreadPlugin from '@babel/plugin-transform-object-rest-spread';
import lockerBabelPluginTransformUnforgeables from '@locker/babel-plugin-transform-unforgeables';
import lwcClassTransformPlugin, { type LwcBabelPluginOptions } from '@lwc/babel-plugin-component';
import {
    CompilerAggregateError,
    CompilerError,
    normalizeToCompilerError,
    TransformerErrors,
    type CompilerDiagnostic,
    type LWCErrorInfo,
} from '@lwc/errors';
import { isAPIFeatureEnabled, APIFeature } from '@lwc/shared';

import type { NormalizedTransformOptions } from '../options';
import type { TransformResult } from './shared';

/**
 * Transforms a JavaScript file.
 * @param code The source code to transform
 * @param filename The source filename, with extension.
 * @param options Transformation options.
 * @returns Compiled code
 * @throws Compilation errors
 * @example
 */
export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const {
        isExplicitImport,
        enableSyntheticElementInternals,
        // TODO [#5031]: Unify dynamicImports and experimentalDynamicComponent options
        experimentalDynamicComponent: dynamicImports,
        outputConfig: { sourcemap },
        enableLightningWebSecurityTransforms,
        namespace,
        name,
        instrumentation,
        apiVersion,
        experimentalErrorRecoveryMode,
    } = options;

    const lwcBabelPluginOptions: LwcBabelPluginOptions = {
        isExplicitImport,
        dynamicImports,
        enableSyntheticElementInternals,
        namespace,
        name,
        instrumentation,
        apiVersion,
    };

    const plugins: babel.PluginItem[] = [
        [lwcClassTransformPlugin, lwcBabelPluginOptions],
        [babelClassPropertiesPlugin, { loose: true }],
    ];

    if (!isAPIFeatureEnabled(APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION, apiVersion)) {
        plugins.push(babelObjectRestSpreadPlugin);
    }

    if (enableLightningWebSecurityTransforms) {
        plugins.push(
            lockerBabelPluginTransformUnforgeables,
            babelAsyncToGenPlugin,
            babelAsyncGeneratorFunctionsPlugin
        );
    }

    const extractLwcErrors = (result: babel.BabelFileResult): CompilerDiagnostic[] => {
        if (!experimentalErrorRecoveryMode) {
            return [];
        }

        const metadata = result.metadata as { lwcErrors?: CompilerDiagnostic[] };
        return metadata?.lwcErrors ?? [];
    };

    const errors: CompilerError[] = [];

    try {
        const result = babel.transformSync(code, {
            filename,
            sourceMaps: sourcemap,

            // Prevent Babel from loading local configuration.
            babelrc: false,
            configFile: false,

            // Force Babel to generate new line and white spaces. This prevent Babel from generating
            // an error when the generated code is over 500KB.
            compact: false,
            plugins,
            parserOpts: {
                ...(experimentalErrorRecoveryMode ? { errorRecovery: true } : {}),
            },
        })!;

        const lwcErrors = extractLwcErrors(result);

        if (!experimentalErrorRecoveryMode || lwcErrors.length === 0) {
            return {
                code: result.code!,
                map: result.map,
            };
        }

        // Convert CompilerDiagnostic[] to CompilerError[]
        errors.push(...lwcErrors.map((diagnostic) => CompilerError.from(diagnostic)));
    } catch (e) {
        // If we are here in errorRecoveryMode then it's most likely that we have run into
        // an unforeseen error
        let transformerError: LWCErrorInfo = TransformerErrors.JS_TRANSFORMER_ERROR;

        // Sniff for a Babel decorator error, so we can provide a more helpful error message.
        if (
            (e as any).code === 'BABEL_TRANSFORM_ERROR' &&
            (e as any).message?.includes('Decorators are not enabled.') &&
            /\b(track|api|wire)\b/.test((e as any).message) // sniff for @track/@api/@wire
        ) {
            transformerError = TransformerErrors.JS_TRANSFORMER_DECORATOR_ERROR;
        }
        throw normalizeToCompilerError(transformerError, e, { filename });
    }

    if (experimentalErrorRecoveryMode && errors.length > 0) {
        throw new CompilerAggregateError(errors, 'Multiple errors occurred during compilation.');
    }

    // This should never be reached in normal operation, but satisfies TypeScript
    throw new Error(`Something went wrong, you shouldn't be getting this.`);
}
