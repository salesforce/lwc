/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'node:path';

import { isString } from '@lwc/shared';
import { TransformerErrors, generateCompilerError, invariant } from '@lwc/errors';
import { compileComponentForSSR, compileTemplateForSSR } from '@lwc/ssr-compiler';

import { validateTransformOptions } from '../options';
import styleTransform from './style';
import templateTransformer from './template';
import scriptTransformer from './javascript';
import type { NormalizedTransformOptions, TransformOptions } from '../options';
import type { TransformResult } from './shared';

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
            reject(error as Error);
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
    switch (path.extname(filename)) {
        case '.html':
            if (options.targetSSR) {
                return compileTemplateForSSR(src, filename, options, options.ssrMode);
            }
            return templateTransformer(src, filename, options);

        case '.css':
            return styleTransform(src, filename, options);

        case '.tsx':
        case '.jsx':
        case '.ts':
        case '.js':
        case '.mts':
        case '.mjs':
            if (options.targetSSR) {
                return compileComponentForSSR(src, filename, options, options.ssrMode);
            }
            return scriptTransformer(src, filename, options);

        default:
            throw generateCompilerError(TransformerErrors.NO_AVAILABLE_TRANSFORMER, {
                messageArgs: [filename],
                origin: { filename },
            });
    }
}
