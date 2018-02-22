import { transform } from 'babel-core';
//import { CompilerOptions } from '../compiler';

import * as raptorCompatTransformPlugin from 'babel-plugin-transform-proxy-compat';

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_COMPAT } from '../babel-plugins';

/**
 * Rollup plugin transforms for compat mode:
 *      - Proxy compat
 *      - ES2015+ transpilation to ES5
 */
export default function({ resolveProxyCompat }) {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [
            ...BABEL_PLUGINS_COMPAT,
            [
                raptorCompatTransformPlugin,
                {
                    resolveProxyCompat,
                },
            ],
        ],
    });

    return {
        name: 'compat',

        transform(src) {
            const { code, map } = transform(src, config);
            return { code, map };
        },
    };
}
