/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { worker } = require('workerpool');
const { rollup } = require('rollup');
const { rollupWatch } = require('./rollup_watch');
const { rollupConfig, generateTarget } = require('./rollup');

async function build(targets, workerId) {
    const targetConfigs = targets.map((config) => rollupConfig(config));
    const { inputOptions } = targetConfigs[0]; // inputOptions are all the same
    const bundle = await rollup(inputOptions);
    await Promise.all(
        targetConfigs.map(async ({ outputOptions, display }) => {
            await generateTarget({
                bundle,
                outputOptions,
                display,
                workerId,
            });
        })
    );
}

function watch(target) {
    const { inputOptions, outputOptions } = rollupConfig(target);
    rollupWatch({ inputOptions, outputOptions });
}

worker({
    build,
    watch,
});
