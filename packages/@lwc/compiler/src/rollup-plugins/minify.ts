/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import minify from 'babel-preset-minify';

import { BABEL_CONFIG_BASE } from '../babel-plugins';
import { NormalizedOutputConfig } from '../compiler/options';

export const MINIFY_CONFIG: any = Object.assign(
    {
        comments: false,
    },
    BABEL_CONFIG_BASE,
    {
        presets: [[minify, { guards: false, evaluate: false }]],
    },
);

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function({ sourcemap }: NormalizedOutputConfig) {
    const config = Object.assign({}, MINIFY_CONFIG, { sourceMaps: sourcemap });

    return {
        name: 'lwc-minify',

        transformBundle(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        },
    };
}
