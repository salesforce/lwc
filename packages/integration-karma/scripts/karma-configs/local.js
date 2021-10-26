/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';
const { TEST_HYDRATION } = require('../shared/options');
const loadBaseConfig = TEST_HYDRATION ? require('./hydration-base') : require('./base');

module.exports = (config) => {
    loadBaseConfig(config);

    config.set({
        reporters: [...config.reporters, 'progress'],

        browsers: ['Chrome'],

        plugins: [...config.plugins, 'karma-chrome-launcher'],
    });
};
