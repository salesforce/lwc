import templateParserPlugin from 'babel-plugin-transform-raptor-template';
import templateCleanupPlugin from 'raptor-html-cleanup-transform';
import { transform } from 'babel-core';

export default function (src: string, options: any): any {
    options = options || {};

    let localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [ templateParserPlugin ],
        filename: options.filename
    };

    localBabelConfig = Object.assign({}, options.babelConfig, localBabelConfig);

    return templateCleanupPlugin.transform(src).then((result) => {
        const transformed = transform(result, localBabelConfig);
        return {
            code: transformed.code,
            map: transformed.map,
            metadata: transformed.metadata
        };
    });
}
