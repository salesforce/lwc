/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { worker } = require('workerpool');
const { rollup } = require('rollup');
const { rollupConfig, generateTarget } = require('./rollup');

async function compile(targets, workerId) {
    const targetConfigs = targets.map((config) => rollupConfig(config));
    const bundle = await rollup(targetConfigs[0].inputOptions); // inputOptions are all the same
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

worker({
    compile,
});
