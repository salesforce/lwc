/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

import { resolve } from 'path';

import options from '../../shared/options';
const { ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION, GREP, COVERAGE, COVERAGE_DIR_FOR_OPTIONS } = options;

import karmaPluginHydrationTests from '../../../vitest-plugins/hydration-tests';
import karmaPluginEnv from '../../../vitest-plugins/env';
import karmaPluginTransformFramework from '../../../vitest-plugins/transform-framework.js';
import utils from '../utils';
const { createPattern } = utils;

const BASE_DIR = resolve(__dirname, '../../../test-hydration');
const COVERAGE_DIR = resolve(__dirname, '../../../coverage');

const SYNTHETIC_SHADOW = require.resolve('@lwc/synthetic-shadow/dist/index.js');
const LWC_ENGINE = require.resolve('@lwc/engine-dom/dist/index.js');

const TEST_UTILS = require.resolve('../../../helpers/test-utils');
const TEST_SETUP = require.resolve('../../../helpers/test-setup');
const TEST_HYDRATE = require.resolve('../../../helpers/test-hydrate');

const ALL_FRAMEWORK_FILES = [SYNTHETIC_SHADOW, LWC_ENGINE];

// Fix Node warning about >10 event listeners ("Possible EventEmitter memory leak detected").
// This is due to the fact that we are running so many simultaneous rollup commands
// on so many files. For every `*.spec.js` file, Rollup adds a listener at
// this line: https://github.com/rollup/rollup/blob/35cbfae/src/utils/hookActions.ts#L37
process.setMaxListeners(1000);

function getFiles() {
    return [
        ...(ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION ? [createPattern(SYNTHETIC_SHADOW)] : []),
        createPattern(LWC_ENGINE),
        createPattern(TEST_SETUP),
        createPattern(TEST_UTILS),
        createPattern(TEST_HYDRATE),
        createPattern('**/*.spec.js', { watched: false }),
    ];
}

/**
 * More details here:
 * https://karma-runner.github.io/3.0/config/configuration-file.html
 * @param config
 */
export default (config: any) => {
    config.set({
        basePath: BASE_DIR,
        files: getFiles(),

        // Transform all the spec files with the hydration-tests karma plugin.
        preprocessors: {
            '**/*.spec.js': ['hydration-tests'],
            // Transform all framework files with the transform-framework plugin
            ...Object.fromEntries(
                ALL_FRAMEWORK_FILES.map((file) => [file, ['transform-framework']])
            ),
        },

        // Use the env plugin to inject the right environment variables into the app
        // Use jasmine as test framework for the suite.
        frameworks: ['env', 'jasmine'],

        // Specify what plugin should be registered by Karma.
        plugins: [
            'karma-jasmine',
            karmaPluginHydrationTests,
            karmaPluginEnv,
            karmaPluginTransformFramework,
        ],

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
        config.preprocessors[LWC_ENGINE].push('coverage');
        config.preprocessors[SYNTHETIC_SHADOW].push('coverage');

        config.reporters.push('coverage');
        config.plugins.push('karma-coverage');

        config.coverageReporter = {
            dir: resolve(COVERAGE_DIR, 'hydration', COVERAGE_DIR_FOR_OPTIONS),
            reporters: [{ type: 'html' }, { type: 'json' }],
        };
    }
};
