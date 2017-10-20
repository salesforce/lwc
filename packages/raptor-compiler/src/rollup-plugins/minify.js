import { transform } from 'babel-core';
import babili from 'babel-preset-babili';

import { BABEL_CONFIG_BASE } from '../babel-plugins';

export const MINIFY_CONFIG = Object.assign({}, BABEL_CONFIG_BASE, babili());

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function(options) {
    return {
        name: 'minify',

        transformBundle(src) {
            const { code, map } = transform(src, MINIFY_CONFIG);
            return { code, map };
        },
    };
}
