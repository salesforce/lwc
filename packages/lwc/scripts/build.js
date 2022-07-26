/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { buildTargets, watchTargets } = require('./utils/generate_targets');
const { createDir, getEs6ModuleEntry, buildBundleConfig } = require('./utils/helpers');

// -- globals -----------------------------------------------------------------
const distDirectory = path.join(__dirname, '../dist');

const COMMON_TARGETS = [
    // ESM
    { target: 'es2017', format: 'esm', prod: false },

    // IIFE
    { target: 'es2017', format: 'iife', prod: false },
    { target: 'es2017', format: 'iife', prod: true },
    { target: 'es2017', format: 'iife', prod: true, debug: true },

    // UMD
    { target: 'es2017', format: 'umd', prod: false },
    { target: 'es2017', format: 'umd', prod: true },
    { target: 'es2017', format: 'umd', prod: true, debug: true },
];

// -- Helpers -----------------------------------------------------------------

function buildEngineTargets(targets) {
    const name = 'LWC';
    const targetName = 'engine-dom';
    const input = getEs6ModuleEntry('@lwc/engine-dom');
    const dir = path.join(distDirectory, 'engine-dom');
    const engineConfig = { input, name, targetName, dir };

    return targets.map((bundleConfig) => buildBundleConfig(engineConfig, bundleConfig));
}

function buildEngineServerTargets(targets) {
    const targetName = 'engine-server';
    const input = getEs6ModuleEntry('@lwc/engine-server');
    const dir = path.join(distDirectory, 'engine-server');
    const engineConfig = { input, targetName, dir };

    return targets.map((bundleConfig) => buildBundleConfig(engineConfig, bundleConfig));
}

function buildSyntheticShadow(targets) {
    const name = 'SyntheticShadow';
    const targetName = 'synthetic-shadow';
    const input = getEs6ModuleEntry('@lwc/synthetic-shadow');
    const dir = path.join(distDirectory, 'synthetic-shadow');
    const engineConfig = { input, name, targetName, dir };

    return targets.map((bundleConfig) => buildBundleConfig(engineConfig, bundleConfig));
}

function buildWireService(targets) {
    const name = 'WireService';
    const targetName = 'wire-service';
    const input = getEs6ModuleEntry('@lwc/wire-service');
    const dir = path.join(distDirectory, 'wire-service');
    const engineConfig = { input, name, targetName, dir };

    return targets.map((bundleConfig) => buildBundleConfig(engineConfig, bundleConfig));
}

// -- Build -------------------------------------------------------------------

(async () => {
    createDir(distDirectory);
    const allTargets = [
        ...buildEngineTargets(COMMON_TARGETS),
        ...buildSyntheticShadow(COMMON_TARGETS),
        ...buildWireService(COMMON_TARGETS),
        ...buildEngineServerTargets([
            { target: 'es2017', format: 'esm', prod: false },
            { target: 'es2017', format: 'commonjs', prod: false },
            { target: 'es2017', format: 'commonjs', prod: true },
        ]),
    ];
    process.stdout.write('\n# Generating LWC artifacts...\n');
    const watch = process.argv.includes('--watch');
    if (watch) {
        watchTargets(allTargets);
    } else {
        await buildTargets(allTargets);
    }
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
