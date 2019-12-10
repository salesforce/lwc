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
export default function({ sourcemap }: NormalizedOutputConfig): Plugin {
    // [perf optimization] inline the import to prevent node-tool from parsing unused lib until compiling for 'prod'.
    const { minify } = require('terser');
    return {
        name: 'lwc-minify',

        renderChunk(src: string) {
            const { code, map, error } = minify(src, {
                sourceMap: sourcemap,
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
