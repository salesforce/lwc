/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import glob from 'glob';
import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';

const rootDir = path.join(__dirname, 'src');

function createConfig(componentFile, engineType) {
    const lwcImportModule = engineType === 'server' ? '@lwc/engine-server' : '@lwc/engine-dom';
    return {
        input: componentFile,
        plugins: [
            lwc({ rootDir }),
            replace({
                preventAssignment: true,
                // always run perf tests in prod mode
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
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
            file: componentFile.replace('/src/', `/dist/${engineType}/`),
            format: 'esm',
        },
        // These packages need to be external so that perf-benchmarks can potentially swap them out
        // (e.g. to allow them to run in server mode or DOM mode), and so that Tachometer can swap them out.
        external: ['lwc', '@lwc/engine-server', '@lwc/engine-dom'],
    };
}

const components = glob.sync(path.join(__dirname, 'src/**/*.js'));

const config = ['server', 'dom']
    .map((engineType) => components.map((component) => createConfig(component, engineType)))
    .flat();

export default config;
