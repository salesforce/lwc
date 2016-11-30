import { extname } from 'path';
import annotationsPlugin from 'babel-plugin-transform-flow-strip-types';
import { transform } from 'babel-core';

export default function (options = { babelConfig : {} }) {
    const localBabelConfig = {
        babelrc: false,
        plugins: [ annotationsPlugin ],
        parserOpts:  {
            plugins: ['*']
        } 
    };

    options = Object.assign({}, options.babelConfig, localBabelConfig);
        
    return {
        name : 'template-parser',
        injected: false,

        transform (src, id) {
            if (extname(id) !== '.js') {
                return src;
            }
            const localOptions = Object.assign(options, { filename: id });
            const {code, map} = transform(src, localOptions);
            return { code, map }
            
        }       
    };
}