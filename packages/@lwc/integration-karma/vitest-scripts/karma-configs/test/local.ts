/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import loadBaseConfig, { type Config } from './base.js';

export default (config: Config) => {
    loadBaseConfig(config);

    Object.assign(config, {
        reporters: [...config.reporters, 'progress'],
        browsers: ['Chrome'],
        plugins: [...config.plugins, 'karma-chrome-launcher'],
    });
};
