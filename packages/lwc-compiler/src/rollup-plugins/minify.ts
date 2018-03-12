import * as babel from '@babel/core';
import * as minify from 'babel-preset-minify';

import { BABEL_CONFIG_BASE } from '../babel-plugins';

export const MINIFY_CONFIG: any = Object.assign({}, BABEL_CONFIG_BASE, {
    presets: [[minify, { guards: false, evaluate: false }]]
});

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function() {
    return {
        name: 'lwc-minify',

        transformBundle(src: string) {
            const { code, map } = babel.transform(src, MINIFY_CONFIG);
            return { code, map };
        },
    };
}
