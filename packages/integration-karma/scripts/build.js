/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

const glob = require('glob');
const rimraf = require('rimraf');
const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const compatRollupPlugin = require('rollup-plugin-compat');

const CONFIG_FILENAME = 'config.json';
const SPEC_ENTRY_FILENAME = 'index.spec.js';

const TEST_FOLDER = path.resolve(__dirname, '../test');
const DIST_FOLDER = path.resolve(__dirname, '../dist');

run({
    compat: !!process.env.COMPAT,
});

async function run(config) {
    let failedBuilds = 0;

    cleanup();

    const suites = glob
        .sync(`**/${SPEC_ENTRY_FILENAME}`, { cwd: TEST_FOLDER })
        .map(suiteFromDirectory);

    await Promise.all(
        suites.map(suite =>
            compileSuite(suite, config).catch(err => {
                failedBuilds++;
                console.error(`Failed to compile "${suite.fullName}":\n${err.stack}\n`);
            }),
        ),
    );

    saveConfig(config);

    process.exit(failedBuilds);
}

function suiteFromDirectory(relativeEntry) {
    const splitPath = relativeEntry.split(path.sep);

    const name = splitPath[splitPath.length - 2];
    const ancestors = splitPath.slice(splitPath.length - 2);

    const fullName = [...ancestors, name].join(' - ');

    return {
        name,
        fullName,
        ancestors,
        entry: path.resolve(TEST_FOLDER, relativeEntry),
    };
}

function cleanup() {
    rimraf.sync(DIST_FOLDER);
}

async function compileSuite(suite, config) {
    const { entry, name, ancestors } = suite;
    const { compat = false } = config;

    const plugins = [
        lwcRollupPlugin({
            // Disable package resolution for now of performance reasons.
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

    const bundle = await rollup({
        input: entry,
        plugins,

        // Rollup should not attempt to resolve the engine, Karma takes care of injecting it globally in the page
        // before running the tests.
        external: ['lwc'],
    });

    return bundle.write({
        file: path.resolve(DIST_FOLDER, ...ancestors, `${name}.spec.js`),
        format: 'iife',

        // The engine is injected as UMD, and we need to indicate that the `lwc` import has to be resolved to the
        // `Engine` property assigned to the `window` object.
        globals: {
            lwc: 'Engine',
        },
    });
}

function saveConfig(config) {
    fs.writeFileSync(
        path.resolve(DIST_FOLDER, CONFIG_FILENAME),
        JSON.stringify(config, null, 4),
    );
}
