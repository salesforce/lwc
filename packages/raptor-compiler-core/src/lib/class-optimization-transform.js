import optimizeClassTransform from './babel-plugin-optimize-class';
import * as babel from 'babel-core';

export function transform (src, options) {
    const localBabelConfig = {
        babelrc: false,
        plugins: [optimizeClassTransform]
    };
    
    //const { code, map } = babel.transform(src, localBabelConfig);
    //return { code, map };

    return src;
}