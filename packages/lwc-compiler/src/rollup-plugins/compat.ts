import * as babel from '@babel/core';
import * as presetCompat from 'babel-preset-compat';

import { BABEL_CONFIG_BASE } from '../babel-plugins';

const BABEL_CONFIG_CONFIG = {
    ...BABEL_CONFIG_BASE,
    presets: [
        [presetCompat, { proxy: true }],
    ],
};

export default function() {
    return {
        name: "lwc-compat",

        transform(src: string) {
            const { code, map } = babel.transform(src, BABEL_CONFIG_CONFIG);
            return { code, map };
        }
    };
}
