import raptorClassTransformPlugin from 'babel-plugin-transform-raptor-class';
import publicFieldsPlugin from 'babel-plugin-transform-class-properties';
import { transform } from 'babel-core';

export default function (code: any, options: any) {
    options = options || {};

    const filename = options.filename;
    const componentName = options.componentName;

    let localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [
            [
                raptorClassTransformPlugin, {
                    componentNamespace: options.componentNamespace,
                    componentName : componentName
                }
            ],
            publicFieldsPlugin
        ],
        parserOpts: { plugins: ['*'] },
        filename
    };

    localBabelConfig = Object.assign({}, options.babelConfig, localBabelConfig);
    const transformed = transform(code, localBabelConfig);

    return { code: transformed.code, map: transformed.map, metadata: transformed.metadata };

}
