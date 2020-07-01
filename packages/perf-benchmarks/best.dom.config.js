/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const config = require('./best.base.config');

module.exports = {
    ...config,

    projectName: '@lwc/engine-dom',
    testMatch: ['**/__benchmarks__/engine-dom/**/*.benchmark.js'],
    plugins: ['<rootDir>/best-plugins/synthetic-shadow.js', ...config.plugins],
};
