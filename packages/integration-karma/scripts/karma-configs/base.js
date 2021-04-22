/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const path = require('path');
const { getModulePath } = require('lwc');

const karmaPluginLwc = require('../karma-plugins/lwc');
const karmaPluginEnv = require('../karma-plugins/env');
const { COMPAT, NATIVE_SHADOW, TAGS, GREP, COVERAGE } = require('../shared/options');

const BASE_DIR = path.resolve(__dirname, '../../test');
const COVERAGE_DIR = path.resolve(__dirname, '../../coverage');

const SYNTHETIC_SHADOW = getModulePath('synthetic-shadow', 'iife', 'es2017', 'dev');
const SYNTHETIC_SHADOW_COMPAT = getModulePath('synthetic-shadow', 'iife', 'es5', 'dev');
const LWC_ENGINE = getModulePath('engine-dom', 'iife', 'es2017', 'dev');
const LWC_ENGINE_COMPAT = getModulePath('engine-dom', 'iife', 'es5', 'dev');
const WIRE_SERVICE = getModulePath('wire-service', 'iife', 'es2017', 'dev');
const WIRE_SERVICE_COMPAT = getModulePath('wire-service', 'iife', 'es5', 'dev');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');
const TEST_UTILS = require.resolve('../../helpers/test-utils');
const WIRE_SETUP = require.resolve('../../helpers/wire-setup');
const TEST_SETUP = require.resolve('../../helpers/test-setup');

function createPattern(location, config = {}) {
    return {
        ...config,
        pattern: location,
    };
}

function getFiles() {
    const frameworkFiles = [];

    if (COMPAT) {
        frameworkFiles.push(createPattern(POLYFILL_COMPAT));
        frameworkFiles.push(createPattern(SYNTHETIC_SHADOW_COMPAT));
        frameworkFiles.push(createPattern(LWC_ENGINE_COMPAT));
        frameworkFiles.push(createPattern(WIRE_SERVICE_COMPAT));
    } else {
        if (!NATIVE_SHADOW) {
            frameworkFiles.push(createPattern(SYNTHETIC_SHADOW));
        }
        frameworkFiles.push(createPattern(LWC_ENGINE));
        frameworkFiles.push(createPattern(WIRE_SERVICE));
    }
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
            jasmine: {
                random: false, // required for clean-dom/index.spec.js to run in consistent order
            },
        },
    });

    // The code coverage is only enabled when the flag is passed since it makes debugging the engine code harder.
    if (COVERAGE) {
        // Indicate to Karma to instrument the code to gather code coverage.
        config.preprocessors[COMPAT ? LWC_ENGINE_COMPAT : LWC_ENGINE] = ['coverage'];
        config.preprocessors[COMPAT ? WIRE_SERVICE_COMPAT : WIRE_SERVICE] = ['coverage'];
        config.preprocessors[COMPAT ? SYNTHETIC_SHADOW_COMPAT : SYNTHETIC_SHADOW] = ['coverage'];

        config.reporters.push('coverage');
        config.plugins.push('karma-coverage');

        config.coverageReporter = {
            dir: path.resolve(COVERAGE_DIR, TAGS.join('_')),
            reporters: [{ type: 'html' }, { type: 'json' }],
        };
    }
};
