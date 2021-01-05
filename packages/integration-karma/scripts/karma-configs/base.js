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
const babelIstanbulInstrumenter = require('../karma-plugins/babel-istanbul-instrumenter');

const BASE_DIR = path.resolve(__dirname, '../../test');
const COVERAGE_DIR = path.resolve(__dirname, '../../coverage');

const SHADOW_POLYFILL = getModulePath('synthetic-shadow', 'iife', 'es2017', 'dev');
const SHADOW_POLYFILL_COMPAT = getModulePath('synthetic-shadow', 'iife', 'es5', 'dev');
const LWC_ENGINE = getModulePath('engine', 'iife', 'es2017', 'dev');
const LWC_ENGINE_COMPAT = getModulePath('engine', 'iife', 'es5', 'dev');
const WIRE_SERVICE = getModulePath('wire-service', 'iife', 'es2017', 'dev');
const WIRE_SERVICE_COMPAT = getModulePath('wire-service', 'iife', 'es5', 'dev');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');
const TEST_UTILS = require.resolve('../../helpers/test-utils');
const WIRE_SETUP = require.resolve('../../helpers/wire-setup');

function createPattern(location, config = {}) {
    return {
        ...config,
        pattern: location,
    };
}

function getLwcConfig(config) {
    const compat = Boolean(config.compat);
    const nativeShadow = Boolean(config.nativeShadow);

    const tags = [`${nativeShadow ? 'native' : 'synthetic'}-shadow`, compat && 'compat'].filter(
        Boolean
    );

    return {
        compat,
        nativeShadow,
        tags,
    };
}

function getFiles(lwcConfig) {
    const frameworkFiles = [];
    if (lwcConfig.compat) {
        frameworkFiles.push(createPattern(POLYFILL_COMPAT));
        frameworkFiles.push(createPattern(SHADOW_POLYFILL_COMPAT));
        frameworkFiles.push(createPattern(LWC_ENGINE_COMPAT));
        frameworkFiles.push(createPattern(WIRE_SERVICE_COMPAT));
    } else {
        if (!lwcConfig.nativeShadow) {
            frameworkFiles.push(createPattern(SHADOW_POLYFILL));
        }
        frameworkFiles.push(createPattern(LWC_ENGINE));
        frameworkFiles.push(createPattern(WIRE_SERVICE));
    }
    frameworkFiles.push(createPattern(WIRE_SETUP));

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
    const lwcConfig = getLwcConfig(config);

    config.set({
        basePath: BASE_DIR,
        files: getFiles(lwcConfig),

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
            args: [...config.client.args, '--grep', config.grep],
        },

        // Attach the config object so configurations extending this one will be able to tap into the parsed
        // configuration.
        lwc: lwcConfig,
    });

    // The code coverage is only enabled when the flag is passed since it makes debugging the engine code harder.
    if (config.coverage) {
        // Indicate to Karma to instrument the engine to gather code coverage.
        config.preprocessors[lwcConfig.compat ? LWC_ENGINE_COMPAT : LWC_ENGINE] = ['coverage'];
        // Indicate to Karma to instrument the wire service to gather code coverage.
        config.preprocessors[lwcConfig.compat ? WIRE_SERVICE_COMPAT : WIRE_SERVICE] = ['coverage'];

        config.reporters.push('coverage');
        config.plugins.push('karma-coverage');

        config.coverageReporter = {
            dir: path.resolve(COVERAGE_DIR, lwcConfig.tags.join('_')),
            reporters: [{ type: 'html' }, { type: 'json' }],

            // The instrumenter used by default by karma-coverage doesn't play well with es6+ syntax. We need to
            // override the default instrumenter with a more recent version using Babel.
            instrumenter: {
                '**/*.js': 'babel-instanbul',
            },
            instrumenters: {
                'babel-instanbul': babelIstanbulInstrumenter,
            },
        };
    }
};
