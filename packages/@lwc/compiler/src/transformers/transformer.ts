/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';

import { isString } from '@lwc/shared';
import {
    TransformerErrors,
    generateCompilerError,
    invariant,
    CompilerDiagnostic,
} from '@lwc/errors';

import { NormalizedTransformOptions, TransformOptions, validateTransformOptions } from '../options';
import styleTransform from './style';
import templateTransformer from './template';
import scriptTransformer from './javascript';

export interface TransformResult {
    code: string;
    map: unknown;
    warnings?: CompilerDiagnostic[];
    cssScopeTokens?: string[];
}

/**
 * Transforms the passed code. Returning a Promise of an object with the generated code, source map
 * and gathered metadata.
 *
 * @deprecated Use transformSync instead.
 */
export function transform(
    src: string,
    filename: string,
    options: TransformOptions
): Promise<TransformResult> {
    validateArguments(src, filename);
    return new Promise((resolve, reject) => {
        try {
            const res = transformSync(src, filename, options);
            resolve(res);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Transform the passed source code. Returning an object with the generated code, source map and
 * gathered metadata.
 */
export function transformSync(
    src: string,
    filename: string,
    options: TransformOptions
): TransformResult {
    validateArguments(src, filename);
    const normalizedOptions = validateTransformOptions(options);
    return transformFile(src, filename, normalizedOptions);
}

function validateArguments(src: string, filename: string) {
    invariant(isString(src), TransformerErrors.INVALID_SOURCE, [src]);
    invariant(isString(filename), TransformerErrors.INVALID_ID, [filename]);
}

function transformFile(
    src: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    let transformer;

    switch (path.extname(filename)) {
        case '.html':
            transformer = templateTransformer;
            break;

        case '.css':
            transformer = styleTransform;
            break;

        case '.ts':
        case '.js':
            transformer = scriptTransformer;
            break;

        default:
            throw generateCompilerError(TransformerErrors.NO_AVAILABLE_TRANSFORMER, {
                messageArgs: [filename],
                origin: { filename },
            });
    }

    return transformer(src, filename, options);
}
