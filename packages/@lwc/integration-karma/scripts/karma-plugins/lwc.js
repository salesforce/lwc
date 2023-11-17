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

const os = require('node:os');
const path = require('node:path');
const { pool } = require('workerpool');
const {
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    API_VERSION,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
} = require('../shared/options');
const Watcher = require('./Watcher');

// The default maxWorkers is cpus.length - 1, but Karma is basically idle while Rollup is running.
// Plus, we want it to run 2 threads in CI
const maxWorkers = os.cpus().length;
const workerPool = pool(require.resolve('./worker.js'), { maxWorkers });

// start loading code in the worker as early as possible
for (let i = 0; i < maxWorkers; i++) {
    workerPool.exec('warmup', []);
}

function createPreprocessor(config, emitter, logger) {
    const { basePath } = config;

    const log = logger.create('preprocessor-lwc');
    const watcher = new Watcher(config, emitter, log);

    return async (content, file, done) => {
        const input = file.path;

        const suiteDir = path.dirname(input);

        // TODO [#3370]: remove experimental template expression flag
        const experimentalComplexExpressions = suiteDir.includes('template-expressions');

        const lwcRollupPluginOptions = {
            sourcemap: true,
            experimentalDynamicComponent: {
                loader: 'test-utils',
                strict: true,
            },
            enableDynamicComponents: true,
            experimentalComplexExpressions,
            enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
            disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
            apiVersion: API_VERSION,
        };

        const { code, map, watchFiles, error } = await workerPool.exec('transform', [
            {
                basePath,
                suiteDir,
                input,
                lwcRollupPluginOptions,
            },
        ]);

        if (error) {
            const location = path.relative(basePath, file.path);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

            if (process.env.KARMA_MODE === 'watch') {
                log.error('Ignoring error in watch mode');
                done(null, content); // just pass the untransformed content in for now
            } else {
                done(error, null);
            }
        } else {
            // no error
            watcher.watchSuite(input, watchFiles);

            // We need to assign the source to the original file so Karma can source map the error in the console. Add
            // also adding the source map inline for browser debugging.
            // eslint-disable-next-line require-atomic-updates
            file.sourceMap = map;

            done(null, code);
        }
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:lwc': ['factory', createPreprocessor] };
