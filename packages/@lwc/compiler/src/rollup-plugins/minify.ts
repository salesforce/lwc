/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { minify } from 'terser';
import { NormalizedOutputConfig } from '../compiler/options';

/**
 * Rollup plugin applying minification to the generated bundle.
 */
export default function({ sourcemap }: NormalizedOutputConfig) {
    return {
        name: 'lwc-minify',

        transformBundle(src: string) {
            return minify(src, {
                sourceMap: sourcemap,
            });
        },
    };
}
