import * as path from 'path';

import styleTransform from './transformers/style';
import templateTransformer from './transformers/template';
import javascriptTransformer from './transformers/javascript';
import compatPluginFactory from "./rollup-plugins/compat";
import { isCompat } from './modes';

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
export default async function transform(src, id, options) {
    const transfomer = getTransformer(id);
    const mergedOptions = Object.assign({}, options, { filename: id });
    const result = await Promise.resolve(transfomer( src, mergedOptions));

    if (isCompat(options.mode)) {
        const { transform } = compatPluginFactory(mergedOptions);
        return transform(result.code);
    }

    return result;
}
