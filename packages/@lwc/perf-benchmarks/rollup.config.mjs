/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { globSync } from 'glob';
import inject from '@rollup/plugin-inject';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Figure out all the packages we might be importing from @lwc/perf-benchmarks-components
// so that we can tell Rollup that those are `external`.
const componentModules = globSync(
    path.join(__dirname, '../perf-benchmarks-components/dist/**/*.js')
).map((filename) => path.relative(path.join(__dirname, '../..'), filename).replace(/^\.\//, ''));

function createConfig(benchmarkFile) {
    // Pseudo-Best benchmark framework implementing globals `before`, `after`, `benchmark`, `run`
    const benchmarkFramework = path.resolve(__dirname, './src/utils/benchmark-framework.js');
    return {
        input: benchmarkFile,
        plugins: [
            inject(
                // Replace global references to `after`/`before`/`benchmark`/`run` with explicit imports
                Object.fromEntries(
                    ['after', 'before', 'benchmark', 'run'].map((name) => [
                        name,
                        [benchmarkFramework, name],
                    ])
                )
            ),
        ],
        output: {
            file: benchmarkFile.replace('/src/', '/dist/'),
            format: 'esm',
        },
        // These packages need to be external so that Tachometer can dynamically swap them out
        // when comparing the current PR to the tip-of-tree
        external: [
            '@lwc/engine-server',
            '@lwc/engine-dom',
            '@lwc/synthetic-shadow',
            ...componentModules,
        ],
    };
}

const benchmarkFiles = globSync(path.join(__dirname, 'src/__benchmarks__/**/*.js'));

const config = benchmarkFiles.map(createConfig);

export default config;
