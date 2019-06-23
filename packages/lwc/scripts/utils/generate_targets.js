const workerFarm = require('worker-farm');
const isCI = require('is-ci');

const DEFAULT_FARM_OPTS = {
    maxConcurrentWorkers: isCI ? 2 : require('os').cpus().length,
    maxConcurrentCallsPerWorker: 2,
};

module.exports = function generateTargets(targets, opts = {}) {
    const workers = workerFarm(
        { ...DEFAULT_FARM_OPTS, ...opts },
        require.resolve('./child_worker')
    );
    const jobs = targets.length;
    let jobsCompleted = 0;

    return new Promise((resolve, reject) => {
        targets.forEach(config => {
            workers(config, err => {
                if (err) {
                    return reject(err);
                }

                if (++jobsCompleted === jobs) {
                    workerFarm.end(workers);
                    resolve();
                }
            });
        });
    });
};
