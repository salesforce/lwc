/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = [
    ...require('./rollup.config.es-and-cjs'),
    ...require('./rollup.config.umd.dev'),
    ...require('./rollup.config.umd.prod'),
];
