/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const config = require('./best.base.config');

module.exports = {
    ...config,

    projectName: '@lwc/engine-server',
    testMatch: ['**/__benchmarks__/engine-server/**/*.benchmark.js'],
    plugins: ['<rootDir>/best-plugins/server-resolver.js', ...config.plugins],
};
