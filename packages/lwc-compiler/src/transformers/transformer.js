import * as path from 'path';
import { MODES, isProd, isCompat } from '../modes';

import styleTransform from './style';
import templateTransformer from './template';
import javascriptTransformer from './javascript';
import compatPluginFactory from "../rollup-plugins/compat";

import * as replacePlugin from "rollup-plugin-replace";
import minifyPlugin from "../rollup-plugins/minify";
import { isString } from '../utils';

const DEFAULT_TRANSFORM_OPTIONS = { mode: MODES.DEV };


//
export function transform(src, id, options) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    //options = Object.assign({}, DEFAULT_TRANSFORM_OPTIONS, options);

    return transformFile(src, id, options);
}

export function transformBundle(src, options) {
    const mode = options.mode;

    if (isProd(mode)) {
        const rollupReplace = replacePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') });
        const rollupMinify = minifyPlugin(options);
        const resultReplace = rollupReplace.transform(src, '$__tmpBundleSrc');
        const result = rollupMinify.transformBundle(resultReplace ? resultReplace.code : src);

        src = result.code;
    }

    return src;
}




/**
 * Returns the associted transformer for a specific file
 * @param {string} fileName
 */
function getTransformer(fileName) {
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
async function transformFile(src, id, options) {
    const transfomer = getTransformer(id);
    const { outputConfig } = options;
    const mergedOptions = Object.assign({}, options, { filename: id });
    const result = await Promise.resolve(transfomer( src, mergedOptions));

    if (isCompat(outputConfig)) {
        const { transform } = compatPluginFactory(mergedOptions);
        return transform(result.code);
    }

    return result;
}
