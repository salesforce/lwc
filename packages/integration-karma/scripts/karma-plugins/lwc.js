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

const chokidar = require('chokidar');
const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const compatRollupPlugin = require('rollup-plugin-compat');

function createPreprocessor(config, emitter, logger) {
    const { basePath, compat = false } = config;

    const log = logger.create('preprocessor-lwc');
    const watcher = new Watcher(config, emitter, log);

    // Cache reused between each compilation to speed up the compilation time.
    let cache;

    const plugins = [
        lwcRollupPlugin({
            // Disable package resolution to avoid lookup in the node_modules directory to boost the initial compilation
            // time.
            resolveFromPackages: false,
        }),
    ];

    if (compat) {
        plugins.push(
            compatRollupPlugin({
                // The compat polyfills are injected at runtime by Karma, polyfills can be shared between all the
                // suites.
                polyfills: false,
            }),
        );
    }

    return async (_content, file, done) => {
        const input = file.path;

        const suiteDir = path.dirname(input);

        // Wrap all the tests into a describe block with the file stricture name
        const ancestorDirectories = path.relative(basePath, suiteDir).split(path.sep);
        const intro = ancestorDirectories.map(tag => `describe("${tag}", function () {`).join('\n');
        const outro = ancestorDirectories.map(() => `});`).join('\n');

        try {
            const bundle = await rollup({
                input,
                plugins,
                cache,

                // Rollup should not attempt to resolve the engine and the test utils, Karma takes care of injecting it
                // globally in the page before running the tests.
                external: ['lwc', 'test-utils'],
            });

            watcher.watchSuite(suiteDir, input);

            cache = bundle.cache;

            let { code, map } = await bundle.generate({
                format: 'iife',
                sourcemap: 'inline',

                // The engine and the test-utils is injected as UMD. This mapping defines how those modules can be
                // referenced from the window object.
                globals: {
                    lwc: 'Engine',
                    'test-utils': 'TestUtils',
                },

                intro,
                outro,
            });

            // We need to assign the source to the original file so Karma can source map the error in the console. Add
            // also adding the source map inline for browser debugging.
            file.sourceMap = map;
            code + `\n//# sourceMappingURL=${map.toUrl()}\n`;

            done(null, code);
        } catch (error) {
            const location = path.relative(basePath, file.path);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

            done(error, null);
        }
    };
}

class Watcher {
    constructor(config, emitter, logger) {
        const { basePath } = config;

        this._suites = [];
        this._watcher = chokidar.watch(basePath, {
            ignoreInitial: true,
        });

        this._watcher.on('all', (_type, filename) => {
            logger.info(`Change detected ${path.relative(basePath, filename)}`);
            emitter.refreshFiles();
        });
    }

    watchSuite(suiteDir) {
        this._suites.push(suiteDir);
    }
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:lwc': ['factory', createPreprocessor] };
