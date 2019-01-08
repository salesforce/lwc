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
const COVERAGE_DIR = path.resolve(__dirname, '../coverage');

const LWC_ENGINE = require.resolve('@lwc/engine/dist/umd/es2017/engine.js');
const LWC_ENGINE_COMPAT = require.resolve('@lwc/engine/dist/umd/es5/engine.js');
const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');

const TEST_UTILS_FAKE_SHADOW = require.resolve(
    '../helpers/test-utils-fake-shadow',
);
const TEST_UTILS_NATIVE_SHADOW = require.resolve(
    '../helpers/test-utils-native-shadow',
);

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
    const frameworkFiles = config.compat
        ? [createPattern(POLYFILL_COMPAT), createPattern(LWC_ENGINE_COMPAT)]
        : [createPattern(LWC_ENGINE)];

    const testUtilsFiles = config.nativeShadow
        ? [createPattern(TEST_UTILS_NATIVE_SHADOW)]
        : [createPattern(TEST_UTILS_FAKE_SHADOW)];

    const preprocessors = {
        '**/*.spec.js': ['lwc'],
    };

    const reporters = ['progress'];

    // If the coverage argument is passed, we need to instrument the engine code, and add the coverage to the list of
    // reporter. We don't want to always enable the coverage transformations, since it makes debugging the engine code
    // harder.
    if (config.coverage) {
        preprocessors[LWC_ENGINE] = ['coverage'];
        preprocessors[LWC_ENGINE_COMPAT] = ['coverage'];

        reporters.push('coverage');
    }

    config.set({
        basePath: BASE_DIR,
        files: [
            ...frameworkFiles,
            ...testUtilsFiles,
            createPattern('**/*.spec.js', { watched: false }),
        ],

        preprocessors,

        reporters,

        frameworks: ['jasmine'],

        plugins: [
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-jasmine',
            karmaPluginLwc,
        ],

        // The karma start command doesn't allow arguments passing, so we need to pass the grep arg manually.
        client: {
            args: ['--grep', config.grep],
        },

        coverageReporter: {
            type: 'lcov',
            dir: COVERAGE_DIR,
        },
    });
};
