/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This transformation converts ESM format to IIFE format. We prefer IIFE format in our Karma tests.
 */
'use strict';

const path = require('path');
const { rollup } = require('rollup');
const Watcher = require('./Watcher');

function getIifeName(filename) {
    if (filename.includes('@lwc/engine-dom')) {
        return 'LWC';
    }
    if (filename.includes('@lwc/wire-service')) {
        return 'WireService';
    }
}

function createPreprocessor(config, emitter, logger) {
    const { basePath } = config;

    const log = logger.create('preprocessor-esm-to-iife');
    const watcher = new Watcher(config, emitter, log);

    // Cache reused between each compilation to speed up the compilation time.
    let cache;

    return async (_content, file, done) => {
        const input = file.path;

        try {
            const bundle = await rollup({
                input,
                cache,
            });

            watcher.watchSuite(input, bundle.watchFiles);

            // eslint-disable-next-line require-atomic-updates
            cache = bundle.cache;

            const iifeName = getIifeName(input);

            const { output } = await bundle.generate({
                format: 'iife',
                sourcemap: 'inline',
                name: iifeName,
            });

            const { code, map } = output[0];

            // We need to assign the source to the original file so Karma can source map the error in the console. Add
            // also adding the source map inline for browser debugging.
            // eslint-disable-next-line require-atomic-updates
            file.sourceMap = map;

            done(null, code);
        } catch (error) {
            const location = path.relative(basePath, file.path);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

            done(error, null);
        }
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:esm-to-iife': ['factory', createPreprocessor] };
