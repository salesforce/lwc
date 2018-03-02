import { transform } from 'babel-core';
import * as lwcClassTransformPlugin from 'babel-plugin-transform-lwc-class';

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from '../babel-plugins';

export default function(code, options) {
    const { filename } = options;

    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [
            lwcClassTransformPlugin,
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
