/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { promisify } = require('util');
const workerFarm = require('worker-farm');
const isCI = require('is-ci');

const DEFAULT_FARM_OPTS = {
    maxConcurrentWorkers: isCI ? 2 : require('os').cpus().length,
    maxConcurrentCallsPerWorker: 2,
};

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

module.exports = async function generateTargets(targets, opts = {}) {
    const workers = workerFarm(
        { ...DEFAULT_FARM_OPTS, ...opts },
        require.resolve('./child_worker')
    );

    const targetGroups = groupByInputOptions(targets);

    try {
        await Promise.all(targetGroups.map((targetGroup) => promisify(workers)(targetGroup)));
    } finally {
        workerFarm.end(workers);
    }
};
