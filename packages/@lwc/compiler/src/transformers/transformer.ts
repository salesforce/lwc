/*
 * Copyright (c) 2024, Salesforce, Inc.
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

/** The object returned after transforming code. */
export interface TransformResult {
    /** The compiled source code. */
    code: string;
    /** The generated source map. */
    map: unknown;
    /** Any diagnostic warnings that may have occurred. */
    warnings?: CompilerDiagnostic[];
    /**
     * String tokens used for style scoping in synthetic shadow DOM and `*.scoped.css`, as either
     * attributes or classes.
     */
    cssScopeTokens?: string[];
}

/**
 * Transform the passed source code.
 * @param src The source to be transformed. Can be the content of a JavaScript, HTML, or CSS file.
 * @param filename The source filename, with extension.
 * @param options The transformation options. The `name` and the `namespace` of the component is the
 * minimum required for transformation.
 * @returns A promise resolving to an object with the generated code, source map and gathered metadata.
 * @example
 * const source = `
 *     import { LightningElement } from 'lwc';
 *     export default class App extends LightningElement {}
 * `;
 * const filename = 'app.js';
 * const options = {
 *     namespace: 'c',
 *     name: 'app',
 * };
 * const { code } = await transform(source, filename, options);
 * @deprecated Use {@linkcode transformSync} instead
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
 * Transform the passed source code
 * @param src The source to be transformed. Can be the content of a JavaScript, HTML, or CSS file.
 * @param filename The source filename, with extension.
 * @param options The transformation options. The `name` and the `namespace` of the component is the
 * minimum required for transformation.
 * @returns An object with the generated code, source map and gathered metadata.
 * @example
 *
 * const source = `
 *     import { LightningElement } from 'lwc';
 *     export default class App extends LightningElement {}
 * `;
 * const filename = 'app.js';
 * const options = {
 *     namespace: 'c',
 *     name: 'app',
 * };
 * const { code } = transformSync(source, filename, options);
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
