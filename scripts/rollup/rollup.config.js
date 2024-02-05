/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const { readFileSync } = require('node:fs');
const path = require('node:path');
const MagicString = require('magic-string');
const { rollup } = require('rollup');
const replace = require('@rollup/plugin-replace');
const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

// The assumption is that the build script for each sub-package runs in that sub-package's directory
const packageRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.resolve(packageRoot, './package.json'), 'utf-8'));
const { name: packageName, version, dependencies, peerDependencies } = packageJson;
// This copyright text should match the text in the header/header eslint rule
let banner = `/**\n * Copyright (c) ${new Date().getFullYear()} Salesforce, Inc.\n */`;
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

const onwarn = ({ code, message }) => {
    if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
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

// Only used for @lwc/engine-dom
// The renderer in the renderer factory needs to be inlined in the function, with all of its dependencies.
// The reasons for this are due to how Locker does sandboxing.
// So we run Rollup inside of a Rollup plugin to accomplish this. This resolves all dependencies and
// builds them as an IIFE, which can then be injected into the source as process.env.RENDERER.
function injectInlineRenderer() {
    const rendererReplacementString = 'process.env.RENDERER';

    return {
        name: 'inject-inline-renderer',

        async transform(source) {
            if (source.includes(rendererReplacementString)) {
                const bundle = await rollup({
                    input: path.resolve(
                        __dirname,
                        '../../packages/@lwc/engine-dom/src/renderer/index.ts'
                    ),

                    plugins: [
                        // In the inline renderer, we only allow certain dependencies. Any others should fail
                        nodeResolve({
                            resolveOnly: ['@lwc/shared'],
                        }),
                        ...sharedPlugins(),
                    ],

                    onwarn,
                });
                const { output } = await bundle.generate({
                    sourcemap: true,
                    name: 'renderer',
                    format: 'iife',
                    esModule: false, // no need for `Object.defineProperty(exports, '__esModule', { value: true })`
                });
                const { code, modules } = output[0];

                // In watch mode, Rollup doesn't know by default that we care about `./renderer/index.ts` or
                // its dependencies. If we call `addWatchFile` within the transform hook, Rollup will watch these files.
                for (const filename of Object.keys(modules)) {
                    this.addWatchFile(filename);
                }

                const magic = new MagicString(source);

                // The IIFE will contain the string `var renderer = `, which we don't actually need. We just need the
                // part after, which is the actual IIFE (e.g. `(function () { /* code */ })()`)
                magic.replace(rendererReplacementString, code.replace('var renderer = ', ''));

                return {
                    code: magic.toString(),
                    map: magic.generateMap(),
                };
            }
        },
    };
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
            // These are the devDeps that may be inlined into the dist/ bundles
            // These include packages owned by us (LWC, observable-membrane), as well as parse5
            // and its single dependency, which are bundled because it makes it simpler to distribute
            resolveOnly: [
                /^@lwc\//,
                'observable-membrane',
                /^parse5($|\/)/,
                'entities',
                /^@parse5\/tools/,
            ],
        }),
        ...sharedPlugins(),
        injectInlineRenderer(),
    ],

    onwarn,

    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
};
