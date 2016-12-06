import babelDecoratorProps from 'babel-plugin-transform-decorator-props';
import babelInjectPlugin from 'babel-plugin-transform-inject-template';
import { transform } from 'babel-core';

export default function (options = {babelConfig: {}}) {
    const localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [
            babelDecoratorProps, 
            babelInjectPlugin
        ],
        parserOpts: { plugins: ['*'] }
    };

    options = Object.assign({}, options.babelConfig, localBabelConfig);

    return {
        name : 'transform-class',
        injected: false,
        transform (src, id) {
            //console.log('[]transform-class', '\t>> ' , id);
            if (!this.injected) {
                this.injected = true;
                const localOptions = Object.assign(options, { filename: id });
                const { code, map } = transform(src, localOptions);
                return { code, map };    
            }            
        }
    };
}