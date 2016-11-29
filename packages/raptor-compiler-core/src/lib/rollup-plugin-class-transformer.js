import babelDecoratorProps from 'babel-plugin-transform-decorator-props';
import babelInjectPlugin from 'babel-plugin-transform-inject-renderer';
import { transform } from 'babel-core';

export default function (options = {babelConfig: {}}) {
    const localBabelConfig = {
        babelrc: false,
        plugins: [
            babelDecoratorProps, 
            babelInjectPlugin
        ],
        parserOpts: { plugins: ['*'] }
    };

    options = Object.assign({}, options.babelConfig, localBabelConfig);

    return {
        name : 'inject-renderer',
        injected: false,
        transform (code, id) {
            if (!this.injected) {
                this.injected = true;
                const localOptions = Object.assign(options, { filename: id });
                const result = transform(code, localOptions);
                return {
                    code: result.code,
                    map: result.map
                };
            }
        }
        
    };
}