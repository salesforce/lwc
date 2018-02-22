import * as path from 'path';
import { CompilerOptions } from '../options';
import { isCompat } from '../modes';

import styleTransform from './style';
import templateTransformer from './template';
import javascriptTransformer from './javascript';
import compatPluginFactory from "../rollup-plugins/compat";

import { isString } from '../utils';


//
export function transform(src: string, id: string, options: CompilerOptions) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    return transformFile(src, id, options);
}

/**
 * Returns the associted transformer for a specific file
 * @param {string} fileName
 */
function getTransformer(fileName: string) {
    switch (path.extname(fileName)) {
        case '.html':
            return templateTransformer;

        case '.css':
            return styleTransform;

        case '.js':
        case '.ts':
            return javascriptTransformer;

        default:
            throw new Error(`No available transformer for ${fileName}`);
    }
}

/**
 * Run approriate transformation for the passed source
 */
async function transformFile(src: string, id: string, options: CompilerOptions) {
    const mergedOptions = Object.assign({}, options, { filename: id });

    const transformer = getTransformer(id);
    // TODO??
    const result = await Promise.resolve(transformer(src, mergedOptions));

    if (isCompat(mergedOptions.outputConfig)) {
        const { transform } = compatPluginFactory({ resolveProxyCompat: undefined });
        return transform(result.code);
    }

    return result;
}
