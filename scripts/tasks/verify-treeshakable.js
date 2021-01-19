/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Inspired from: https://github.com/Rich-Harris/agadoo

const path = require('path');
const { rollup } = require('rollup');

async function check(input) {
    const resolved = path.resolve(input);

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

    const res = await bundle.generate({
        format: 'esm',
    });

    const [chunk] = res.output;

    return {
        code: chunk.code,
        isTreeShakable: chunk.code.trim().length === 0,
    };
}

const input = process.argv[2];
check(input)
    .then((res) => {
        if (res.isTreeShakable === false) {
            console.error(
                `Failed to fully treeshake ${input}. Remaining code after treeshaking:\n\n${res.code}`
            );
        }

        process.exit(res.isTreeShakable ? 0 : 1);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
