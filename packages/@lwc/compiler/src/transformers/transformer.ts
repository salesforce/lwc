/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';
import { TransformerErrors, generateCompilerError, invariant } from '@lwc/errors';

import { NormalizedCompilerOptions, CompilerOptions, normalizeOptions } from '../compiler/options';

import styleTransform from './style';
import templateTransformer, { TemplateMetadata } from './template';
import scriptTransformer from './javascript';

import { isString } from '../utils';
import { MetadataCollector } from '../bundler/meta-collector';
import { SourceMap } from '../compiler/compiler';

export interface FileTransformerResult {
    code: string;
    metadata?: TemplateMetadata;
    map: SourceMap | null;
}

/**
 * Transforms the passed code. Returning a Promise of an object with the generated code, source map
 * and gathered metadata.
 *
 * @deprecated Use transformSync instead.
 */
export async function transform(
    src: string,
    filename: string,
    options: CompilerOptions
): Promise<FileTransformerResult> {
    return transformSync(src, filename, options);
}

/**
 * Transform the passed source code. Returning an object with the generated code, source map and
 * gathered metadata.
 */
export function transformSync(
    src: string,
    filename: string,
    options: CompilerOptions
): FileTransformerResult {
    invariant(isString(src), TransformerErrors.INVALID_SOURCE, [src]);
    invariant(isString(filename), TransformerErrors.INVALID_ID, [filename]);

    return transformFile(src, filename, normalizeOptions(options));
}

export function transformFile(
    src: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): FileTransformerResult {
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

    return transformer(src, filename, options, metadataCollector);
}
