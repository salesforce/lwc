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
import javascriptTransformer from './javascript';

import { isString } from '../utils';
import { MetadataCollector } from '../bundler/meta-collector';
import { SourceMap } from '../compiler/compiler';

// TODO: Improve on metadata type by providing consistent interface. Currently
// javascript transformer output differs from css and html in that later return a promise
export interface FileTransformerResult {
    code: string;
    metadata?: TemplateMetadata;
    map: SourceMap | null;
}

export type FileTransformer = (
    source: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
) => FileTransformerResult | Promise<FileTransformerResult>;

export function transform(src: string, id: string, options: CompilerOptions) {
    invariant(isString(src), TransformerErrors.INVALID_SOURCE, [src]);
    invariant(isString(id), TransformerErrors.INVALID_ID, [id]);

    return transformFile(src, id, normalizeOptions(options));
}

export function getTransformer(fileName: string): FileTransformer {
    switch (path.extname(fileName)) {
        case '.html':
            return templateTransformer;

        case '.css':
            return styleTransform;

        case '.ts':
        case '.js':
            return javascriptTransformer;

        default:
            throw generateCompilerError(TransformerErrors.NO_AVAILABLE_TRANSFORMER, {
                messageArgs: [fileName],
                origin: { filename: fileName },
            });
    }
}

export async function transformFile(
    src: string,
    id: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
): Promise<FileTransformerResult> {
    const transformer = getTransformer(id);
    return await transformer(src, id, options, metadataCollector);
}
