import babelDecoratorProps from 'babel-plugin-transform-raptor-class';
import { basename } from 'path';
import { transform } from 'babel-core';

export default function (code, options) {
    options = options || {};

    const filename = options.filename;
    const componentName = options.componentBundle && basename(filename, '.js');

    let localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [ [babelDecoratorProps, { componentNamespace: options.componentNamespace, componentName : componentName }]],
        parserOpts: { plugins: ['*'] },
        filename
    };

    localBabelConfig = Object.assign({}, options.babelConfig, localBabelConfig);
    const transformed = transform(code, localBabelConfig);

    return Promise.resolve({ code: transformed.code, map: transformed.map });

}