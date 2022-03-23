/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const workerpool = require('workerpool');
const isCI = require('is-ci');
const os = require('os');

// Group the targets based on their input configuration, which allows us to run
// rollup.rollup() once per unique input combination, and then bundle.generate
// multiple times for each unique output combination.
function groupByInputOptions(configs) {
    const keysToConfigs = {};
    for (const config of configs) {
        const { input, prod, target } = config;
        // These are the only input options that matter for rollup.rollup()
        const key = [input, !!prod, target].join('-');
        keysToConfigs[key] = keysToConfigs[key] || [];
        keysToConfigs[key].push(config);
    }
    return Object.values(keysToConfigs);
}

async function buildTargets(targets) {
    let workerId = 0;

    const pool = workerpool.pool(require.resolve('./child_worker.js'), {
        maxWorkers: isCI ? 2 : os.cpus().length,
    });
    try {
        const targetGroups = groupByInputOptions(targets);
        await Promise.all(
            targetGroups.map((targetGroup) => pool.exec('build', [targetGroup, workerId++]))
        );
    } finally {
        await pool.terminate();
    }
}

function watchTargets(targets) {
    const watchTargets = targets.filter(({ prod, format, debug }) => {
        // In watch mode, we only need to build what we need for local testing in Karma
        return format === 'iife' && !prod && !debug;
    });

    // In watch mode, we need one separate worker for every individual build. There's no point in pooling
    // because they all have to run in parallel.
    const pool = workerpool.pool(require.resolve('./child_worker.js'), {
        maxWorkers: watchTargets.length,
    });
    watchTargets.forEach((target) => {
        pool.exec('watch', [target]).catch((err) => {
            console.error(err);
        });
    });

    process.on('SIGINT', () => {
        // Gracefully exist on Ctrl-C
        pool.terminate().catch((err) => {
            console.error(err);
        });
    });
}

module.exports = {
    buildTargets,
    watchTargets,
};
