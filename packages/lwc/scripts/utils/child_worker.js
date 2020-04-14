/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { rollupConfig, generateTarget } = require('./rollup');

module.exports = function (config, callback) {
    const targetConfig = rollupConfig(config);

    generateTarget(targetConfig)
        .then(() => {
            callback(null, { config, pid: `${process.pid}` });
        })
        .catch((err) => {
            callback(err);
        });
};
