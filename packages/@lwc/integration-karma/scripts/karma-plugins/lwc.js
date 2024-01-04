/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This transformation is inspired from the karma-rollup-transform:
 * https://github.com/jlmakes/karma-rollup-preprocessor/blob/master/lib/index.js
 */
'use strict';

const path = require('path');

const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');

const {
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    API_VERSION,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
} = require('../shared/options');
const Watcher = require('./Watcher');

function createPreprocessor(config, emitter, logger) {
    const { basePath } = config;

    const log = logger.create('preprocessor-lwc');
    const watcher = new Watcher(config, emitter, log);

    // Cache reused between each compilation to speed up the compilation time.
    let cache;

    return async (content, file, done) => {
        const input = file.path;

        const suiteDir = path.dirname(input);

        // Wrap all the tests into a describe block with the file structure name
        // This avoids needing to manually write `describe()` for every file.
        // Also add a dummy test because otherwise Jasmine complains about empty describe()s:
        // https://github.com/jasmine/jasmine/pull/1742
        const ancestorDirectories = path.relative(basePath, suiteDir).split(path.sep);
        const intro =
            ancestorDirectories.map((tag) => `describe("${tag}", function () {`).join('\n') +
            `\nxit("dummy test", () => { /* empty */ });\n`;
        const outro = ancestorDirectories.map(() => `});`).join('\n');

        // TODO [#3370]: remove experimental template expression flag
        const experimentalComplexExpressions = suiteDir.includes('template-expressions');

        const plugins = [
            lwcRollupPlugin({
                // Sourcemaps don't work with Istanbul coverage
                sourcemap: !process.env.COVERAGE,
                experimentalDynamicComponent: {
                    loader: 'test-utils',
                    strict: true,
                },
                enableDynamicComponents: true,
                experimentalComplexExpressions,
                enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
                disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
                apiVersion: API_VERSION,
            }),
        ];

        try {
            const bundle = await rollup({
                input,
                plugins,
                cache,

                // Rollup should not attempt to resolve the engine and the test utils, Karma takes care of injecting it
                // globally in the page before running the tests.
                external: ['lwc', 'wire-service', 'test-utils', '@test/loader'],

                onwarn(warning, warn) {
                    // Ignore warnings from our own Rollup plugin
                    if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                        warn(warning);
                    }
                },
            });

            watcher.watchSuite(input, bundle.watchFiles);

            // eslint-disable-next-line require-atomic-updates
            cache = bundle.cache;

            const { output } = await bundle.generate({
                format: 'iife',
                // Sourcemaps don't work with Istanbul coverage
                sourcemap: process.env.COVERAGE ? false : 'inline',

                // The engine and the test-utils is injected as UMD. This mapping defines how those modules can be
                // referenced from the window object.
                globals: {
                    lwc: 'LWC',
                    'wire-service': 'WireService',
                    'test-utils': 'TestUtils',
                },

                intro,
                outro,
            });

            const { code, map } = output[0];

            if (map) {
                // We need to assign the source to the original file so Karma can source map the error in the console. Add
                // also adding the source map inline for browser debugging.
                // eslint-disable-next-line require-atomic-updates
                file.sourceMap = map;
            }

            done(null, code);
        } catch (error) {
            const location = path.relative(basePath, file.path);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

            if (process.env.KARMA_MODE === 'watch') {
                log.error('Ignoring error in watch mode');
                done(null, content); // just pass the untransformed content in for now
            } else {
                done(error, null);
            }
        }
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:lwc': ['factory', createPreprocessor] };
