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

const ENGINE_TYPE_TO_LWC_IMPORT = {
    dom: '@lwc/engine-dom',
    server: '@lwc/engine-server',
    ssr: '@lwc/ssr-runtime',
};

function createConfig(componentFile, engineType) {
    const rootDir = componentFile.includes(tmpDir)
        ? path.join(tmpDir, 'src')
        : path.join(__dirname, 'src');
    const lwcImportModule = ENGINE_TYPE_TO_LWC_IMPORT[engineType];
    return {
        input: componentFile,
        plugins: [
            lwc({
                rootDir,
                experimentalComplexExpressions: true,
                targetSSR: engineType === 'ssr',
            }),
            replace({
                preventAssignment: true,
                // always run perf tests in prod mode
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            // Replace `import { ... } from 'lwc'` with '@lwc/engine-server' / '@lwc/engine-dom' / '@lwc/ssr-runtime'
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
        external: ['lwc', '@lwc/engine-server', '@lwc/engine-dom', '@lwc/ssr-runtime'],
        onwarn({ message, code }) {
            // We have circular dependencies due to the `tree` component recursively rendering itself.
            // We have unused imports because the `@lwc/ssr-compiler` currently imports `wire`/`api` from `'lwc'`
            // regardless of whether it's used or not.
            // For all other warnings, throw an error out of caution.
            if (!['CIRCULAR_DEPENDENCY', 'UNUSED_EXTERNAL_IMPORT'].includes(code)) {
                throw new Error(message);
            }
        },
    };
}

const components = [...globSync(path.join(__dirname, 'src/**/*.js')), ...styledComponents];

const config = ['server', 'dom', 'ssr']
    .map((engineType) => components.map((component) => createConfig(component, engineType)))
    .flat();

export default config;
