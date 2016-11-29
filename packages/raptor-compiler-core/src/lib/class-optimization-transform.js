import optimizeClassTransform from './babel-plugin-optimize-class';
import * as babel from 'babel-core';

export function transform (code, options) {
    const localBabelConfig = {
        babelrc: false,
        plugins: [
            [optimizeClassTransform, options.sharedMetadata ? options.sharedMetadata : {}] 
        ]
    };
    
    return babel.transform(code, localBabelConfig);
}