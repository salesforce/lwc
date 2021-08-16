/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { rollup } = require('rollup');
const { rollupConfig, generateTarget } = require('./rollup');

module.exports = async function (targets, callback) {
    const targetConfigs = targets.map((config) => rollupConfig(config));

    try {
        const bundle = await rollup(targetConfigs[0].inputOptions); // inputOptions are all the same
        await Promise.all(
            targetConfigs.map(async ({ outputOptions, display }) => {
                await generateTarget({
                    bundle,
                    outputOptions,
                    display,
                });
            })
        );
        callback();
    } catch (err) {
        callback(err);
    }
};
