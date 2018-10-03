import * as babel from '@babel/core';
import * as presetCompat from 'babel-preset-compat';

import { BABEL_CONFIG_BASE } from '../babel-plugins';

const BABEL_CONFIG_CONFIG = {
    ...BABEL_CONFIG_BASE,
    presets: [
        [presetCompat, { proxy: true }],
    ],
};

export default function(sourcemaps?: boolean) {
    const config = Object.assign(
        {},
        BABEL_CONFIG_CONFIG,
        sourcemaps !== undefined ? { sourceMaps: sourcemaps } : {}
    );

    return {
        name: "lwc-compat",

        transform(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        }
    };
}
