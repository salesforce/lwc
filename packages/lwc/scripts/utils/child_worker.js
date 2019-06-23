const { rollupConfig, generateTarget } = require('./rollup');

module.exports = function(config, callback) {
    const targetConfig = rollupConfig(config);

    generateTarget(targetConfig)
        .then(() => {
            callback(null, { config, pid: `${process.pid}` });
        })
        .catch(err => {
            callback(err);
        });
};
