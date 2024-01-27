/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const { readFileSync } = require('node:fs');
const path = require('node:path');
const replace = require('@rollup/plugin-replace');
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

// The assumption is that the build script for each sub-package runs in that sub-package's directory
const packageRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.resolve(packageRoot, './package.json'), 'utf-8'));
const { name: packageName, version } = packageJson;
let banner = `/**\n * Copyright (C) 2023 salesforce.com, inc.\n */`;
let footer = `/** version: ${version} */`;
const { ROLLUP_WATCH: watchMode } = process.env;
const formats = ['es', 'cjs'];

if (packageName === '@lwc/synthetic-shadow') {
    // Here we wrap all of synthetic shadow in a check for lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE, so
    // that synthetic shadow is not loaded at all if the flag is in effect.
    // Note that lwcRuntimeFlags must be referenced as a pure global, or else string replacement in ESBuild
    // will not work. But we also have to check to make sure that lwcRuntimeFlags is defined, so this
    // `Object.defineProperty` code is copied from @lwc/features itself.
    banner += `
    if (!globalThis.lwcRuntimeFlags) {
      Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: Object.create(null) });
    }
    if (!lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE) {
    `
        .replaceAll(/\n {4}/g, '\n')
        .trimEnd();
    footer += '\n}';
}

const onwarn = () => {
    // no-op
};

// These plugins are used both by the main Rollup build as well as our sub-Rollup build (injectInlineRenderer).
function sharedPlugins() {
    const engineBrowserConfig = ['@lwc/engine-server', '@lwc/engine-dom'].includes(packageName) && {
        // This is only used inside @lwc/engine-dom and @lwc/engine-server
        // Elsewhere, it _not_ be replaced, so that it can be replaced later (e.g. in @lwc/engine-core)
        'process.env.IS_BROWSER': packageName === '@lwc/engine-dom' ? 'true' : 'false',
    };

    return [
        typescript({
            target: 'es2017',
            tsconfig: path.join(packageRoot, 'tsconfig.json'),
            noEmitOnError: !watchMode, // in watch mode, do not exit with an error if typechecking fails
            ...(watchMode && {
                incremental: true,
                outputToFilesystem: true,
            }),
        }),
        replace({
            values: {
                ...engineBrowserConfig,
                'process.env.LWC_VERSION': JSON.stringify(version),
            },
            preventAssignment: true,
        }),
    ];
}

module.exports = {
    input: path.resolve(packageRoot, './src/index.ts'),

    output: formats.map((format) => ({
        file: `dist/index${format === 'cjs' ? '.cjs' : ''}.js`,
        sourcemap: true,
        format,
        banner,
        footer,
        exports: 'named',
        esModule: true,
    })),

    plugins: [
        nodeResolve({
            resolveOnly: [
                /^@lwc\//,
                'observable-membrane',
                /^parse5($|\/)/,
                'entities',
                /^@parse5\/tools/,
                /^@babel\/plugin-/,
                /^@babel\/helper/,
            ],
        }),
        commonjs(),
        ...sharedPlugins(),
    ],

    onwarn,
};
