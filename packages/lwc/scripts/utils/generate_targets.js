/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const workerpool = require('workerpool');
const isCI = require('is-ci');
const os = require('os');

const pool = workerpool.pool(require.resolve('./child_worker.js'), {
    maxWorkers: isCI ? 2 : os.cpus().length,
});

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

module.exports = async function generateTargets(targets) {
    const targetGroups = groupByInputOptions(targets);
    let workerId = 0;

    try {
        await Promise.all(
            targetGroups.map((targetGroup) => pool.exec('compile', [targetGroup, workerId++]))
        );
    } finally {
        await pool.terminate();
    }
};
