/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import glob from 'glob';
import replace from '@rollup/plugin-replace';
import syntheticShadow from './rollup-plugins/synthetic-shadow';

// Figure out all the packages we might be importing from @lwc/perf-benchmarks-components
// so that we can tell Rollup that those are `external`.
const componentModules = glob
    .sync(path.join(__dirname, '../perf-benchmarks-components/dist/**/*.js'))
    .map((filename) => path.relative(path.join(__dirname, '../..'), filename).replace(/^\.\//, ''));

function createConfig(benchmarkFile) {
    const isServer = benchmarkFile.includes('/engine-server/');
    const lwcImportModule = isServer ? '@lwc/engine-server' : '@lwc/engine-dom';

    return {
        input: benchmarkFile,
        plugins: [
            !isServer && syntheticShadow(),
            // Replace `import { foo } from 'lwc'` with '@lwc/engine-server' or '@lwc/engine-dom'
            replace({
                preventAssignment: true,
                delimiters: ['', ''],
                values: {
                    'from "lwc"': `from "${lwcImportModule}"`,
                    "from 'lwc'": `from "${lwcImportModule}"`,
                },
            }),
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

const benchmarkFiles = glob.sync(path.join(__dirname, 'src/__benchmarks__/**/*.js'));

const config = benchmarkFiles.map(createConfig);

export default config;
