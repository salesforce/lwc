import functionName from "babel-plugin-transform-es2015-function-name";
import exponentiator from "babel-plugin-transform-exponentiation-operator";
import publicFieldsPlugin from "babel-plugin-transform-class-properties";
import raptorClassTransformPlugin from "babel-plugin-transform-raptor-class";
import { transform } from "babel-core";

export default function (code, options) {
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
            /* See babel-plugins.js*/
            // The following plugins are so we can avoid one extra parsing later
            // for the current browser support
            publicFieldsPlugin,
            exponentiator,
            functionName,
        ],
        parserOpts: { plugins: ['*'] },
        filename
    };

    localBabelConfig = Object.assign({}, options.babelConfig, localBabelConfig);
    const transformed = transform(code, localBabelConfig);

    return { code: transformed.code, map: transformed.map, metadata: transformed.metadata };

}
