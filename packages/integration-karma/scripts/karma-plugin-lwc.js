/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const path = require('path');

const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const compatRollupPlugin = require('rollup-plugin-compat');

function createPreprocessor(config, emitter, logger) {
    const { basePath, compat = false } = config;

    const log = logger.create("preprocessor.rollup");

    // Rollup cache reused between build to speed up the process
    let cache;

    const rollupPlugin = [
        lwcRollupPlugin({
            // Disable package resolution for now of performance reasons.
            resolveFromPackages: false,
        }),
    ];

    if (compat) {
        rollupPlugin.push(
            compatRollupPlugin({
                // The compat polyfills are injected at runtime by Karma, polyfills can be shared between all the
                // suites.
                polyfills: false,
            }),
        );
    }

    return async (content, file, done) => {
        try {
            const bundle = await rollup({
                input: file.path,
                plugins: rollupPlugin,

                // Rollup should not attempt to resolve the engine, Karma takes care of injecting it globally in the page
                // before running the tests.
                external: ['lwc'],
            });

            let { code, map } = await bundle.generate({
                format: 'iife',
                sourcemap: 'inline',

                // The engine is injected as UMD, and we need to indicate that the `lwc` import has to be resolved to the
                // `Engine` property assigned to the `window` object.
                globals: {
                    lwc: 'Engine',
                },
            });

            // We need to assign the source to the original file so Karma can source map the error in the console. Add
            // also adding the source map inline for browser debugging.
            file.sourceMap = map;
            code + `\n//# sourceMappingURL=${map.toUrl()}\n`;

            done(null, code);
        } catch (error) {
            const location = path.relative(basePath, file.path);
            log.error(
                "Error processing “%s”\n\n%s\n",
                location,
                error.stack || error.message
            );

            done(error, null);
        }
    }
}

createPreprocessor.$inject = [
    "config",
    "emitter",
    "logger"
];

module.exports = { "preprocessor:lwc": ["factory", createPreprocessor] };
