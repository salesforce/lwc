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

module.exports = async function generateTargets(targets, opts = {}) {
    const workers = workerFarm(
        { ...DEFAULT_FARM_OPTS, ...opts },
        require.resolve('./child_worker')
    );

    try {
        await Promise.all(targets.map((config) => promisify(workers)(config)));
    } finally {
        workerFarm.end(workers);
    }
};
