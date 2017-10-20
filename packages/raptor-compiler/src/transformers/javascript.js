import { transform } from 'babel-core';
import raptorClassTransformPlugin from 'babel-plugin-transform-raptor-class';

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from '../babel-plugins';

export default function(code, options) {
    const {
        filename,
        moduleName: componentName,
        moduleNamespace: componentNamespace,
    } = options;

    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [
            [raptorClassTransformPlugin, { componentNamespace, componentName }],
            ...BABEL_PLUGINS_BASE,
        ],
        filename,
    });

    const transformed = transform(code, config);

    return {
        code: transformed.code,
        map: transformed.map,
        metadata: transformed.metadata,
    };
}
