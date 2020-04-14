/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Plugin } from 'rollup';

import { NormalizedOutputConfig } from '../options';

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function ({ sourcemap }: NormalizedOutputConfig): Plugin {
    // Inlining the `terser` module require to only pay the parsing and evaluation cost for needed
    // modules
    const { minify } = require('terser');

    return {
        name: 'lwc-minify',

        renderChunk(src: string) {
            const { code, map, error } = minify(src, {
                sourceMap: sourcemap,
                output: {
                    // Wrapping function expressions in parenthesis can be harmful for performance.
                    // Details: https://v8.dev/blog/preparser#pife
                    wrap_func_args: false,
                },
            });

            if (error) {
                throw error;
            }

            if (map) {
                return {
                    code: code!,
                    map: map as any,
                };
            } else {
                return code!;
            }
        },
    };
}
