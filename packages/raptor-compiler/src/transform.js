import * as path from 'path';

import styleTransform from './transformers/style';
import templateTransformer from './transformers/template';
import javascriptTransformer from './transformers/javascript';

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
export default function transform(src, id, options) {
    const transfomer = getTransformer(id);
    return Promise.resolve(
        transfomer(
            src,
            Object.assign({}, options, {
                filename: id,
            }),
        ),
    );
}
