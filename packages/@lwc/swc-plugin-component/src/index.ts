/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { parse, print, transformSync as swcTransformSync } from '@swc/core';
import {
    APIFeature,
    getAPIVersionFromNumber,
    isAPIFeatureEnabled,
    LWC_VERSION_COMMENT,
} from '@lwc/shared';
import { CompilerAggregateError, CompilerError } from '@lwc/errors';
import { LwcSwcVisitor, injectVersionComments } from './visitor';
import { wrapSwcError } from './utils';
import type { Options as SwcOptions } from '@swc/core';
import type { LwcSwcPluginOptions, LwcSwcTransformResult } from './types';

export type { LwcSwcPluginOptions, LwcSwcTransformResult };

/**
 * Computes the SWC jsc.target based on options.
 */
function computeTarget(opts: LwcSwcPluginOptions): string {
    if (opts.enableLightningWebSecurityTransforms) {
        return 'es5';
    }
    if (
        !isAPIFeatureEnabled(
            APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION,
            getAPIVersionFromNumber(opts.apiVersion)
        )
    ) {
        return 'es5';
    }
    return 'es2022';
}

/**
 * Builds the SWC transform configuration.
 */
function buildSwcTransformConfig(opts: LwcSwcPluginOptions): SwcOptions {
    const target = computeTarget(opts) as any;
    return {
        filename: opts.filename,
        sourceMaps: opts.sourcemap ?? false,
        isModule: true,
        jsc: {
            parser: {
                syntax: 'ecmascript',
                decorators: true,
            },
            transform: {
                legacyDecorator: true,
                decoratorMetadata: false,
                useDefineForClassFields: false,
            },
            target,
            preserveAllComments: true,
        },
        module: {
            type: 'es6',
        },
    } as SwcOptions;
}

/**
 * Transforms an LWC component JavaScript/TypeScript source file.
 *
 * Applies all LWC-specific AST transformations (decorator metadata,
 * component registration, scoped CSS import annotation, dynamic import
 * rewriting, compiler version comment) using @swc/core's Visitor API,
 * followed by @swc/core's built-in syntax lowering.
 *
 * @param code    The source code string to transform.
 * @param options Configuration options.
 * @returns       A TransformResult containing { code, map, warnings }.
 * @throws        CompilerError or CompilerAggregateError on transform failure.
 */
export async function transformComponent(
    code: string,
    options: LwcSwcPluginOptions
): Promise<LwcSwcTransformResult> {
    const { filename } = options;

    let parsedAst;
    try {
        parsedAst = await parse(code, {
            syntax: 'ecmascript',
            decorators: true,
            target: 'es2022',
        });
    } catch (e) {
        throw wrapSwcError(e, filename);
    }

    const visitor = new LwcSwcVisitor(code, options);
    const transformedAst = visitor.visitProgram(parsedAst);

    // Check for accumulated errors in recovery mode
    const errors = visitor.getErrors();
    if (errors.length > 0) {
        const compilerErrors = errors.map((d) => CompilerError.from(d));
        throw new CompilerAggregateError(compilerErrors, `LWC compilation errors in ${filename}`);
    }

    // Use SWC to print the transformed AST to code
    let result;
    try {
        result = await print(transformedAst, {
            sourceMaps: options.sourcemap ?? false,
            isModule: true,
            jsc: {
                target: computeTarget(options) as any,
                preserveAllComments: true,
            },
        } as any);
    } catch (e) {
        throw wrapSwcError(e, filename);
    }

    return {
        code: injectVersionComments(result.code, LWC_VERSION_COMMENT),
        map: result.map,
        warnings: [],
    };
}

/**
 * Synchronous version of transformComponent.
 * Uses parse+print separately since SWC's sync API doesn't support
 * the visitor pattern directly.
 *
 * Note: This is provided for compatibility with the existing @lwc/compiler
 * synchronous API. Internally uses synchronous SWC transforms.
 */
export function transformComponentSync(
    code: string,
    options: LwcSwcPluginOptions
): LwcSwcTransformResult {
    const { filename } = options;

    // Use transformSync with plugin option to apply visitor
    const swcConfig = buildSwcTransformConfig(options);

    const visitor = new LwcSwcVisitor(code, options);

    let result;
    try {
        result = swcTransformSync(code, {
            ...swcConfig,
            plugin: (program: any) => visitor.visitProgram(program),
        });
    } catch (e) {
        // In recovery mode, SWC may throw a secondary error (e.g., during code generation)
        // because the AST was partially transformed. If we accumulated validation errors,
        // throw them as a CompilerAggregateError instead of wrapping the SWC error.
        const accumulatedErrors = visitor.getErrors();
        if (options.experimentalErrorRecoveryMode && accumulatedErrors.length > 0) {
            const compilerErrors = accumulatedErrors.map((d) => CompilerError.from(d));
            throw new CompilerAggregateError(
                compilerErrors,
                `LWC compilation errors in ${filename}`
            );
        }
        throw wrapSwcError(e, filename);
    }

    // Check for accumulated errors in recovery mode
    const errors = visitor.getErrors();
    if (errors.length > 0) {
        const compilerErrors = errors.map((d) => CompilerError.from(d));
        throw new CompilerAggregateError(compilerErrors, `LWC compilation errors in ${filename}`);
    }

    return {
        code: injectVersionComments(result.code, LWC_VERSION_COMMENT),
        map: result.map,
        warnings: [],
    };
}
