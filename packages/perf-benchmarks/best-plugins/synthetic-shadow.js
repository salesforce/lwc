/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const SYNTHETIC_IMPORT = 'import "@lwc/synthetic-shadow";';
/*
 * BEST-ROLLUP-PLUGIN
 * This module make sure all test run with synthetic-shadow enabled
 */
module.exports = function () {
    let input;
    return {
        name: 'synthetic-shadow',
        options(rollupOpts) {
            input = rollupOpts.input;
        },
        transform(src, id) {
            const isEntry = id === input;
            const shouldApplySynthetic = id.includes('/wc-');

            if (isEntry && shouldApplySynthetic) {
                src = SYNTHETIC_IMPORT + src;
            }

            return { code: src, map: null };
        },
    };
};
