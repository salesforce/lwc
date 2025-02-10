/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Inspired from: https://github.com/Rich-Harris/agadoo

const { readdirSync, existsSync } = require('fs');
const path = require('path');
const { rollup } = require('rollup');

async function check(input) {
    const dirs = input.split(path.sep);
    dirs.pop(); // remove filename from input
    let cwd = process.cwd();
    while (dirs.length) {
        console.log(`== ${cwd}`);
        console.log(readdirSync(cwd));
        cwd = path.join(cwd, dirs.shift());
    }

    const resolved = path.resolve(input);

    if (existsSync(resolved)) {
        console.log(`${resolved} exists`);
    } else {
        throw new Error(`${resolved} does not exist`);
    }

    // Tell rollup to bundle a fake file whose content is just `import "path from CLI arg"`
    // If the imported file is tree-shakeable (pure imports/exports, no side effects),
    // then the bundled code will be an empty file
    const bundle = await rollup({
        input: '__root__',
        plugins: [
            {
                resolveId(id) {
                    if (id === '__root__') return id;
                },
                load(id) {
                    if (id === '__root__') return `import "${resolved}"`;
                },
            },
        ],
        onwarn: (warning, handle) => {
            if (warning.code !== 'EMPTY_BUNDLE') handle(warning);
        },
    });

    const res = await bundle.generate({ format: 'esm' });

    const [{ code }] = res.output;
    const isTreeShakable = code.trim() === '';
    if (!isTreeShakable) {
        console.error(`${code}\n❗️ Failed to fully treeshake ${input}`);
        process.exitCode = 1;
    }
}

check(process.argv[2]).catch((err) => {
    console.error(err);
    process.exitCode = process.exitCode || 1;
});
