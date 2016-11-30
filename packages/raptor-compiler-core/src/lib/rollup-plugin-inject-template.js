import babelDecoratorProps from 'babel-plugin-transform-decorator-props';
import babelInjectPlugin from 'babel-plugin-transform-inject-template';
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
        transform (src, id) {
            if (this.injected) {
                return src;
            }

            this.injected = true;
            const localOptions = Object.assign(options, { filename: id });
            const {code, map } = transform(src, localOptions);
            return {code, map};
        }
    };
}