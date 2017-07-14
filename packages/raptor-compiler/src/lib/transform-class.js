import functionName from "babel-plugin-transform-es2015-function-name";
import objectRestSpread from "babel-plugin-transform-object-rest-spread";
import publicFieldsPlugin from "babel-plugin-transform-class-properties";
import raptorClassTransformPlugin from "babel-plugin-transform-raptor-class";
import { transform } from "babel-core";

export default function (code, { filename, componentName, componentNamespace, babelConfig } = {}) {

    let localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [
            /* See babel-plugins.js */
            [raptorClassTransformPlugin, {componentNamespace, componentName }],
            [ publicFieldsPlugin, { spec: false }],
            [objectRestSpread, { useBuiltIns: true }],
            functionName,
        ],
        parserOpts: { plugins: ['*'] },
        filename
    };

    localBabelConfig = Object.assign({}, babelConfig, localBabelConfig);
    const transformed = transform(code, localBabelConfig);

    return { code: transformed.code, map: transformed.map, metadata: transformed.metadata };

}
