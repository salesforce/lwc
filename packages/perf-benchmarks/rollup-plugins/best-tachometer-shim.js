/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const SHIM_IMPORT = 'import "best-tachometer-shim-runtime";';

/** This module imports a Best-on-Tachometer shim. Essentially it mimics the Best API
 *  but just calls performance.mark() and performance.measure(), which Tachometer can use.
 */
export default function () {
    let input;
    return {
        name: 'best-tachometer-shim',
        options(rollupOpts) {
            input = rollupOpts.input;
        },
        transform(src, id) {
            const isEntry = id === input;

            if (isEntry) {
                src = SHIM_IMPORT + src;
            }

            return { code: src, map: null };
        },
        resolveId(src) {
            if (src === 'best-tachometer-shim-runtime') {
                return require.resolve('./rollup-plugins/best-tachometer-shim-runtime.js');
            }

            return null;
        },
    };
}
