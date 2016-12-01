import { extname } from 'path';
import annotationsPlugin from 'babel-plugin-transform-flow-strip-types';
import { transform } from 'babel-core';

export default function (options = { babelConfig : {} }) {
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

        transform (src, id) {
            console.log(this.name, id);

            if (extname(id) === '.js') {
                const localOptions = Object.assign(options, { filename: id });
                const {code, map} = transform(src, localOptions);
                return { code, map }    
            }

        }       
    };
}