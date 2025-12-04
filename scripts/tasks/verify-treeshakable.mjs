/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Inspired from: https://github.com/Rich-Harris/agadoo
import { rollup } from 'rollup';
import pluginVirtual from '../rollup/plugin-virtual.mjs';

async function check(input) {
    // Tell rollup to bundle a fake file whose content is just `import "path from CLI arg"`
    // If the imported file is tree-shakeable (pure imports/exports, no side effects),
    // then the bundled code will be an empty file
    const bundle = await rollup({
        input: '__virtual__',
        plugins: [pluginVirtual(`import "${input}";`)],
        onwarn: (warning, handle) => {
            if (warning.code !== 'EMPTY_BUNDLE') handle(warning);
        },
    });

    const res = await bundle.generate({
        format: 'esm',
    });

    const [{ code }] = res.output;

    return {
        code,
        isTreeShakable: code.trim().length === 0,
    };
}

const input = process.argv[2];
const result = await check(input);
if (!result.isTreeShakable) {
    console.error(
        `${result.code}\n❗️ Failed to fully treeshake ${input}; see remaining code above.`
    );
}

process.exitCode = result.isTreeShakable ? 0 : 1;
