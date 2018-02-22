import { transform } from 'babel-core';
import * as raptorClassTransformPlugin from 'babel-plugin-transform-lwc-class';

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from '../babel-plugins';
import { CompilerOptions } from '../options';

export default function(code: string, options: CompilerOptions) {
    const { name } = options;

    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [
            raptorClassTransformPlugin,
            ...BABEL_PLUGINS_BASE,
        ],
        filename: name,
    });

    const transformed = transform(code, config);

    return {
        code: transformed.code,
        map: transformed.map,
        metadata: transformed.metadata,
    };
}
