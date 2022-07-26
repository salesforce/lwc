/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const path = require('path');
const { getModulePath } = require('lwc');

const karmaPluginLwc = require('../../karma-plugins/lwc');
const karmaPluginEnv = require('../../karma-plugins/env');
const { SYNTHETIC_SHADOW_ENABLED, GREP, COVERAGE } = require('../../shared/options');
const { createPattern } = require('../utils');
const TAGS = require('./tags');

const BASE_DIR = path.resolve(__dirname, '../../../test');
const COVERAGE_DIR = path.resolve(__dirname, '../../../coverage');

const SYNTHETIC_SHADOW = getModulePath('synthetic-shadow', 'iife', 'es2017', 'dev');
const LWC_ENGINE = getModulePath('engine-dom', 'iife', 'es2017', 'dev');
const WIRE_SERVICE = getModulePath('wire-service', 'iife', 'es2017', 'dev');

const TEST_UTILS = require.resolve('../../../helpers/test-utils');
const WIRE_SETUP = require.resolve('../../../helpers/wire-setup');
const TEST_SETUP = require.resolve('../../../helpers/test-setup');

// Fix Node warning about >10 event listeners ("Possible EventEmitter memory leak detected").
// This is due to the fact that we are running so many simultaneous rollup commands
// on so many files. For every `*.spec.js` file, Rollup adds a listener at
// this line: https://github.com/rollup/rollup/blob/35cbfae/src/utils/hookActions.ts#L37
process.setMaxListeners(1000);

function getFiles() {
    const frameworkFiles = [];

    if (SYNTHETIC_SHADOW_ENABLED) {
        frameworkFiles.push(createPattern(SYNTHETIC_SHADOW));
    }
    frameworkFiles.push(createPattern(LWC_ENGINE));
    frameworkFiles.push(createPattern(WIRE_SERVICE));
    frameworkFiles.push(createPattern(WIRE_SETUP));
    frameworkFiles.push(createPattern(TEST_SETUP));

    return [
        ...frameworkFiles,
        createPattern(TEST_UTILS),
        createPattern('**/*.spec.js', { watched: false }),
    ];
}

/**
 * More details here:
 * https://karma-runner.github.io/3.0/config/configuration-file.html
 */
module.exports = (config) => {
    config.set({
        basePath: BASE_DIR,
        files: getFiles(),

        // Transform all the spec files with the lwc karma plugin.
        preprocessors: {
            '**/*.spec.js': ['lwc'],
        },

        // Use the env plugin to inject the right environment variables into the app
        // Use jasmine as test framework for the suite.
        frameworks: ['env', 'jasmine'],

        // Specify what plugin should be registered by Karma.
        plugins: ['karma-jasmine', karmaPluginLwc, karmaPluginEnv],

        // Leave the reporter empty on purpose. Extending configuration need to pick the right reporter they want
        // to use.
        reporters: [],

        // Since the karma start command doesn't allow arguments passing, so we need to pass the grep arg manually.
        // The grep flag is consumed at runtime by jasmine to filter what suite to run.
        client: {
            args: [...config.client.args, '--grep', GREP],
        },
    });

    // The code coverage is only enabled when the flag is passed since it makes debugging the engine code harder.
    if (COVERAGE) {
        // Indicate to Karma to instrument the code to gather code coverage.
        config.preprocessors[LWC_ENGINE] = ['coverage'];
        config.preprocessors[WIRE_SERVICE] = ['coverage'];
        config.preprocessors[SYNTHETIC_SHADOW] = ['coverage'];

        config.reporters.push('coverage');
        config.plugins.push('karma-coverage');

        config.coverageReporter = {
            dir: path.resolve(COVERAGE_DIR, TAGS.join('_')),
            reporters: [{ type: 'html' }, { type: 'json' }],
        };
    }
};
