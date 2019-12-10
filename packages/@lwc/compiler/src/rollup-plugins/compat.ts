/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Plugin } from 'rollup';
import { NormalizedOutputConfig } from '../options';

export default function({ sourcemap }: NormalizedOutputConfig): Plugin {
    // [perf optimization] inline these imports to prevent node-tool from parsing unused libs until compiling for 'compat'
    const babel = require('@babel/core');
    const { BABEL_CONFIG_BASE } = require('../babel-plugins');
    const presetCompat = require('babel-preset-compat');

    const BABEL_CONFIG_CONFIG = {
        ...BABEL_CONFIG_BASE,
        presets: [[presetCompat, { proxy: true }]],
    };
    const config = Object.assign({}, BABEL_CONFIG_CONFIG, { sourceMaps: sourcemap });

    return {
        name: 'lwc-compat',

        transform(src: string) {
            const { code, map } = babel.transform(src, config);
            return { code, map };
        },
    };
}
