import { extname } from 'path';
import annotationsPlugin from 'babel-plugin-transform-flow-strip-types';
import { transform } from 'babel-core';

export default function (options: any): any {
    options = options || {};
    options.babelConfig = options.babelConfig || {};

    const localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [ annotationsPlugin ],
        parserOpts:  { plugins: ['*'] }
    };

    options = Object.assign({}, options.babelConfig, localBabelConfig);

    return {
        name : 'remove-annotations',
        injected: false,

        transform (src: string, id: string) {
            //console.log('[]remove-annotation', '\t>> ' , id);
            if (extname(id) === '.js') {
                const localOptions = Object.assign(options, { filename: id });
                const result = transform(src, localOptions);
                return { code: result.code, map: result.map };
            }
        }
    };
}
