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
const karmaPluginNodeEnv = require('../../karma-plugins/node-env');
const { COMPAT, SYNTHETIC_SHADOW_ENABLED, GREP, COVERAGE } = require('../../shared/options');
const { createPattern } = require('../utils');
const TAGS = require('./tags');

const BASE_DIR = path.resolve(__dirname, '../../../test');
const COVERAGE_DIR = path.resolve(__dirname, '../../../coverage');

const SYNTHETIC_SHADOW = getModulePath('synthetic-shadow', 'iife', 'es2017', 'dev');
const SYNTHETIC_SHADOW_COMPAT = getModulePath('synthetic-shadow', 'iife', 'es5', 'dev');
const LWC_ENGINE = getModulePath('engine-dom', 'iife', 'es2017', 'dev');
const LWC_ENGINE_COMPAT = getModulePath('engine-dom', 'iife', 'es5', 'dev');
const WIRE_SERVICE = getModulePath('wire-service', 'iife', 'es2017', 'dev');
const WIRE_SERVICE_COMPAT = getModulePath('wire-service', 'iife', 'es5', 'dev');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');
const FETCH_COMPAT = require.resolve('whatwg-fetch'); // not included in es5-proxy-compat polyfills
const TEST_UTILS = require.resolve('../../../helpers/test-utils');
const WIRE_SETUP = require.resolve('../../../helpers/wire-setup');
const TEST_SETUP = require.resolve('../../../helpers/test-setup');

const ALL_FRAMEWORK_FILES = [
    SYNTHETIC_SHADOW,
    SYNTHETIC_SHADOW_COMPAT,
    LWC_ENGINE,
    LWC_ENGINE_COMPAT,
    WIRE_SERVICE,
    WIRE_SERVICE_COMPAT,
];

// Fix Node warning about >10 event listeners ("Possible EventEmitter memory leak detected").
// This is due to the fact that we are running so many simultaneous rollup commands
// on so many files. For every `*.spec.js` file, Rollup adds a listener at
// this line: https://github.com/rollup/rollup/blob/35cbfae/src/utils/hookActions.ts#L37
process.setMaxListeners(1000);

function getFiles() {
    const frameworkFiles = [];

    if (COMPAT) {
        frameworkFiles.push(createPattern(POLYFILL_COMPAT));
        frameworkFiles.push(createPattern(FETCH_COMPAT));
        frameworkFiles.push(createPattern(SYNTHETIC_SHADOW_COMPAT));
        frameworkFiles.push(createPattern(LWC_ENGINE_COMPAT));
        frameworkFiles.push(createPattern(WIRE_SERVICE_COMPAT));
    } else {
        if (SYNTHETIC_SHADOW_ENABLED) {
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

        preprocessors: {
            // Transform all the spec files with the lwc karma plugin.
            '**/*.spec.js': ['lwc'],
            // Transform all framework files with the node-env plugin
            ...Object.fromEntries(ALL_FRAMEWORK_FILES.map((file) => [file, ['node-env']])),
        },

        // Use the env plugin to inject the right environment variables into the app
        // Use jasmine as test framework for the suite.
        frameworks: ['env', 'jasmine'],

        // Specify what plugin should be registered by Karma.
        plugins: ['karma-jasmine', karmaPluginLwc, karmaPluginEnv, karmaPluginNodeEnv],

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
        config.preprocessors[COMPAT ? LWC_ENGINE_COMPAT : LWC_ENGINE].push('coverage');
        config.preprocessors[COMPAT ? WIRE_SERVICE_COMPAT : WIRE_SERVICE].push('coverage');
        config.preprocessors[COMPAT ? SYNTHETIC_SHADOW_COMPAT : SYNTHETIC_SHADOW].push('coverage');

        config.reporters.push('coverage');
        config.plugins.push('karma-coverage');

        config.coverageReporter = {
            dir: path.resolve(COVERAGE_DIR, TAGS.join('_')),
            reporters: [{ type: 'html' }, { type: 'json' }],
        };
    }
};
