/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Plugin } from 'rollup';
import { minify } from 'terser';

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function ({ sourcemap }: { sourcemap: boolean }): Plugin {
    return {
        name: 'lwc-minify',

        async renderChunk(src: string): Promise<{ code: string; map?: any }> {
            const { code, map } = await minify(src, {
                sourceMap: sourcemap,
                format: {
                    // Wrapping function expressions in parenthesis can be harmful for performance.
                    // Details: https://v8.dev/blog/preparser#pife
                    wrap_func_args: false,
                },
            });

            return {
                code: code!,
                map,
            };
        },
    };
}
