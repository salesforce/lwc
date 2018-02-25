import { transform } from 'babel-core';
import presetCompat from 'babel-preset-compat';
import { BABEL_CONFIG_BASE } from '../babel-plugins';

/**
 * Rollup plugin transforms for compat mode:
 *      - Proxy compat
 *      - ES2015+ transpilation to ES5
 */
export default function({ resolveProxyCompat }) {
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        presets: [
            [presetCompat, { proxy: true, resolveProxyCompat }],
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
