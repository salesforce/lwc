/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';
import loadBaseConfig from './base';

export default (config: {
    set: (arg0: { reporters: any[]; browsers: string[]; plugins: any[] }) => void;
    reporters: any;
    plugins: any;
}) => {
    loadBaseConfig(config);

    config.set({
        reporters: [...config.reporters, 'progress'],

        browsers: ['Chrome'],

        plugins: [...config.plugins, 'karma-chrome-launcher'],
    });
};
