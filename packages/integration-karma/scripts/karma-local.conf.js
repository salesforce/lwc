/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const path = require('path');
const karmaPluginLwc = require('./karma-plugin-lwc');

const BASE_DIR = path.resolve(__dirname, '../test');

const LWC_ENGINE = require.resolve('@lwc/engine/dist/umd/es2017/engine.js');
const LWC_ENGINE_COMPAT = require.resolve('@lwc/engine/dist/umd/es5/engine.js');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');

function createPattern(location, config = {}) {
    return {
        ...config,
        pattern: location,
    };
}

/**
 * More details here:
 * https://karma-runner.github.io/3.0/config/configuration-file.html
 */
module.exports = config => {
    const files = config.compat
        ? [createPattern(POLYFILL_COMPAT), createPattern(LWC_ENGINE_COMPAT)]
        : [createPattern(LWC_ENGINE)];

    config.set({
        basePath: BASE_DIR,
        files: [
            ...files,
            createPattern('**/*.spec.js'),
        ],

        preprocessors: {
            '**/*.spec.js': ['lwc'],
        },

        frameworks: ['jasmine'],

        plugins: [...config.plugins, karmaPluginLwc],
    });
};
