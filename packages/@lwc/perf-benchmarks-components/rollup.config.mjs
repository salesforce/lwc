/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { globSync } from 'glob';
import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import { generateStyledComponents } from './scripts/generate-styled-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { tmpDir, styledComponents } = generateStyledComponents();

function createConfig(componentFile, engineType) {
    const rootDir = componentFile.includes(tmpDir)
        ? path.join(tmpDir, 'src')
        : path.join(__dirname, 'src');
    const lwcImportModule = engineType === 'server' ? '@lwc/engine-server' : '@lwc/engine-dom';
    return {
        input: componentFile,
        plugins: [
            lwc({
                rootDir,
                experimentalComplexExpressions: true,
            }),
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
            file: componentFile.replace(tmpDir, __dirname).replace('/src/', `/dist/${engineType}/`),
            format: 'esm',
        },
        // These packages need to be external so that @lwc/perf-benchmarks can potentially swap them out
        // (e.g. to allow them to run in server mode or DOM mode), and so that Tachometer can swap them out.
        external: ['lwc', '@lwc/engine-server', '@lwc/engine-dom'],
    };
}

const components = [...globSync(path.join(__dirname, 'src/**/*.js')), ...styledComponents];

const config = ['server', 'dom']
    .map((engineType) => components.map((component) => createConfig(component, engineType)))
    .flat();

export default config;
