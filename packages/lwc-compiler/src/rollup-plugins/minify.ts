import * as babel from '@babel/core';
import minify from 'babel-preset-minify';

import { BABEL_CONFIG_BASE } from '../babel-plugins';

export const MINIFY_CONFIG: any = Object.assign({
    comments: false,
}, BABEL_CONFIG_BASE, {
    presets: [[minify, { guards: false, evaluate: false }]]
});

export interface LwcMinifierOptions {
    sourcemap?: boolean | 'inline';
}

function normalizeOptions(options: LwcMinifierOptions | undefined) {
    const defaultOptions = Object.assign({}, MINIFY_CONFIG);

    if (options) {
        if (options.sourcemap !== undefined) {
            defaultOptions.sourceMaps = options.sourcemap;
        }
    }

    return defaultOptions;
}

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function(options?: LwcMinifierOptions) {
    const config = normalizeOptions(options);

    return {
        name: 'lwc-minify',

        transformBundle(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        },
    };
}
