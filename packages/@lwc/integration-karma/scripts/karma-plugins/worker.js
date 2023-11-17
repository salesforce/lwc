/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('node:path');
const { worker } = require('workerpool');
const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');

// Cache reused between each compilation to speed up the compilation time.
let cache;

async function transform({ basePath, suiteDir, input, lwcRollupPluginOptions }) {
    // Wrap all the tests into a describe block with the file stricture name
    const ancestorDirectories = path.relative(basePath, suiteDir).split(path.sep);
    const intro = ancestorDirectories.map((tag) => `describe("${tag}", function () {`).join('\n');
    const outro = ancestorDirectories.map(() => `});`).join('\n');

    try {
        const bundle = await rollup({
            input,
            plugins: [lwcRollupPlugin(lwcRollupPluginOptions)],
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

        const { watchFiles } = bundle.watchFiles;

        // eslint-disable-next-line require-atomic-updates
        cache = bundle.cache;

        const { output } = await bundle.generate({
            format: 'iife',
            sourcemap: 'inline',

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

        return { code, map, watchFiles };
    } catch (error) {
        return { error };
    }
}

// noop just so we can require() all the code we need as early as possible
function warmup() {}

worker({
    transform,
    warmup,
});
