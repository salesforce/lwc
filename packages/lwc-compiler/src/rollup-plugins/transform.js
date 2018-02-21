import * as path from 'path';

import styleTransform from '../transformers/style';
import templateTransformer from '../transformers/template';
import javascriptTransformer from '../transformers/javascript';

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
 *  Transfrom each file individually
 */
export default function({ $metadata, options }) {

    return {
        name: 'transform',

        async transform(src, id) {
            const transfom = getTransformer(id);
            const result = await transfom(
                src,
                Object.assign({}, options, {
                    filename: id,
                })
            );

            $metadata[id] = result.metadata;
            return result;
        },
    };
}
