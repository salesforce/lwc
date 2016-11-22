import babelInjectPlugin from 'babel-plugin-transform-inject-renderer';
import { transform } from 'babel-core';

export default function (options = {}) {
    const babelConfig = {
        babelrc: false,
        plugins: [ babelInjectPlugin ],
        parserOpts: { plugins: ['*'] }
    };

    return {
        name : 'inject-renderer',
        injected: false,
    
        transform (code, id) {
            console.log('> [rollup-plugin-inject-renderer] - Transform: ', id);
            const localOptions = Object.assign({ filename: id }, babelConfig);

            if (!this.injected) {
                this.injected = true;
                const result = transform(code, localOptions);
                return {
                    code: result.code,
                    map: result.map
                };
            }
        }
        
    };
}