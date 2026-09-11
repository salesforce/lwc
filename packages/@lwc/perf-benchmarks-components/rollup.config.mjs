/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { globSync } from 'glob';
import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import { generateStyledComponents } from './scripts/generate-styled-components.mjs';

const { tmpDir, styledComponents } = generateStyledComponents();

const ENGINE_TYPE_TO_LWC_IMPORT = {
    dom: '@lwc/engine-dom',
    server: '@lwc/engine-server',
    ssr: '@lwc/ssr-runtime',
    // Vapor is a client (DOM) runtime; its compiled output imports its runtime helpers from here.
    vapor: '@lwc/engine-vapor',
};

// Components that cannot be compiled/run for a given engine type, and are therefore skipped when
// building that engine's dist (they are still built for every other engine). The matching
// benchmarks are skipped for that engine's run too — keep this in sync with
// `VAPOR_UNSUPPORTED_BENCHMARK_PATTERNS` in `@lwc/perf-benchmarks`'s `best.config.js`.
//
// Vapor exclusions:
//   - wireAdapterComponent: uses the `@wire` decorator, which Vapor Mode does not support at
//     runtime. No DOM benchmark imports it, so nothing that runs under vapor depends on it.
//   - expression: its template wraps a template literal inside a ternary
//     (`{cond ? \`...${x}...\` : '...'}`), which the vapor template compiler currently emits as
//     unparseable output ("Unexpected token `)`. Expected `}`").
const ENGINE_TYPE_UNSUPPORTED_COMPONENTS = {
    vapor: ['/wireAdapterComponent/', '/expression/'],
};

function isComponentSupported(componentFile, engineType) {
    const unsupported = ENGINE_TYPE_UNSUPPORTED_COMPONENTS[engineType] ?? [];
    return !unsupported.some((needle) => componentFile.includes(needle));
}

function createConfig(componentFile, engineType) {
    const rootDir = componentFile.includes(tmpDir)
        ? path.join(tmpDir, 'src')
        : path.join(import.meta.dirname, 'src');
    const lwcImportModule = ENGINE_TYPE_TO_LWC_IMPORT[engineType];
    return {
        input: componentFile,
        plugins: [
            lwc({
                rootDir,
                experimentalComplexExpressions: true,
                targetSSR: engineType === 'ssr',
                // Compile templates to fine-grained reactive Vapor output for the `vapor` engine.
                enableVaporCompilation: engineType === 'vapor',
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
            file: componentFile
                .replace(tmpDir, import.meta.dirname)
                .replace('/src/', `/dist/${engineType}/`),
            format: 'esm',
        },
        // These packages need to be external so that @lwc/perf-benchmarks can potentially swap them out
        // (e.g. to allow them to run in server mode or DOM mode), and so that Tachometer can swap them out.
        external: [
            'lwc',
            '@lwc/engine-server',
            '@lwc/engine-dom',
            '@lwc/ssr-runtime',
            '@lwc/engine-vapor',
        ],
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

const components = [
    ...globSync(path.join(import.meta.dirname, 'src/**/*.js')),
    ...styledComponents,
];

// The set of engines to build for. Defaults to the classic three; `PERF_ENGINES` (comma-separated)
// overrides it so a caller can build only what a given perf run needs, e.g.
// `PERF_ENGINES=dom,vapor` for the vapor-vs-classic comparison, or `PERF_ENGINES=vapor` on its own.
const DEFAULT_ENGINES = ['server', 'dom', 'ssr'];
const engineTypes = process.env.PERF_ENGINES
    ? process.env.PERF_ENGINES.split(',')
          .map((engine) => engine.trim())
          .filter(Boolean)
    : DEFAULT_ENGINES;

for (const engineType of engineTypes) {
    if (!(engineType in ENGINE_TYPE_TO_LWC_IMPORT)) {
        throw new Error(
            `Unknown PERF_ENGINES entry "${engineType}". Valid values: ${Object.keys(
                ENGINE_TYPE_TO_LWC_IMPORT
            ).join(', ')}`
        );
    }
}

const config = engineTypes
    .map((engineType) =>
        components
            .filter((component) => isComponentSupported(component, engineType))
            .map((component) => createConfig(component, engineType))
    )
    .flat();

export default config;
