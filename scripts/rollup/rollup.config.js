/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// @ts-check
/* eslint-env node */

import { readFileSync } from 'node:fs';
import { resolve, join, relative, extname } from 'node:path';
import { globSync } from 'glob';
import MagicString from 'magic-string';
import { rollup } from 'rollup';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { BUNDLED_DEPENDENCIES } from '../shared/bundled-dependencies.js';

// The assumption is that the build script for each sub-package runs in that sub-package's directory
const packageRoot = process.cwd();

/**
 * @type {import('nx/src/utils/package-json.js').PackageJson}
 */
const pkg = JSON.parse(readFileSync(resolve(packageRoot, './package.json'), 'utf-8'));
// This copyright text should match the text in the header/header eslint rule
let banner = `/**\n * Copyright (c) ${new Date().getFullYear()} Salesforce, Inc.\n */`;
let footer = `/** version: ${pkg.version} */`;
const { ROLLUP_WATCH: watchMode } = process.env;

/**
 * @type {import('rollup').ModuleFormat[]}
 */
const formats = ['es', 'cjs'];

if (pkg.name === '@lwc/synthetic-shadow') {
    // Here we wrap all of synthetic shadow in a check for lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE and
    // lwcRuntimeFlags.DISABLE_SYNTHETIC_SHADOW, so that synthetic shadow is not loaded if either flag is set.
    // Note that lwcRuntimeFlags must be referenced as a pure global, or else string replacement in ESBuild
    // will not work. But we also have to check to make sure that lwcRuntimeFlags is defined, so this
    // `Object.defineProperty` code is copied from @lwc/features itself.
    banner += `
    if (!globalThis.lwcRuntimeFlags) {
      Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: Object.create(null) });
    }
    if (!lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE && !lwcRuntimeFlags.DISABLE_SYNTHETIC_SHADOW) {
    `
        .replaceAll(/\n {4}/g, '\n')
        .trimEnd();
    footer += '\n}';
}

/**
 * @type {import('rollup').WarningHandlerWithDefault} warning
 */
const onwarn = ({ code, message }) => {
    if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
};

// These plugins are used both by the main Rollup build as well as our sub-Rollup build (injectInlineRenderer).
/**
 * @returns {import('rollup').Plugin[]}
 */
function sharedPlugins() {
    const engineBrowserConfig = ['@lwc/engine-server', '@lwc/engine-dom'].includes(pkg.name) && {
        // This is only used inside @lwc/engine-dom and @lwc/engine-server
        // Elsewhere, it _not_ be replaced, so that it can be replaced later (e.g. in @lwc/engine-core)
        'process.env.IS_BROWSER': pkg.name === '@lwc/engine-dom' ? 'true' : 'false',
    };

    return [
        typescript({
            tsconfig: join(packageRoot, 'tsconfig.json'),
            exclude: ['**/__tests__/**'],
            noEmitOnError: !watchMode, // in watch mode, do not exit with an error if typechecking fails
            ...(watchMode && {
                incremental: true,
                outputToFilesystem: true,
            }),
            declarationDir: 'dist', // must match `output.file` in the overall Rollup config
        }),
        replace({
            values: {
                ...engineBrowserConfig,
                'process.env.LWC_VERSION': JSON.stringify(pkg.version),
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
/**
 * @returns {import('rollup').Plugin}
 */
function injectInlineRenderer() {
    const rendererReplacementString = 'process.env.RENDERER';

    return {
        name: 'inject-inline-renderer',

        async transform(source) {
            if (source.includes(rendererReplacementString)) {
                const bundle = await rollup({
                    input: resolve(
                        import.meta.dirname,
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

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
    input: generateInputConfig(),

    output: formats.map(createOutputConfig),

    plugins: [
        nodeResolve({
            // These are the dependencies that, when used as devDeps, should be inlined into the dist/ bundles
            resolveOnly: [
                /^@lwc\//,
                // capture the package itself (e.g. `foo`) plus its files (e.g. `foo/bar.js`)
                ...BUNDLED_DEPENDENCIES.map((dep) => new RegExp(`^${dep}($|/)`)),
            ],
        }),
        ...sharedPlugins(),
        injectInlineRenderer(),
    ],

    onwarn,

    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
};

/**
 * @returns {import('rollup').InputOption}
 */
function generateInputConfig() {
    if (pkg.name === '@lwc/shared') {
        return Object.fromEntries(
            globSync('src/*.ts', { root: packageRoot }).map((file) => [
                // This remove `src/` as well as the file extension from each
                // file, so e.g. src/nested/foo.js becomes nested/foo
                relative(`${packageRoot}/src`, file.slice(0, file.length - extname(file).length)),
                // This expands the relative paths to absolute paths, so e.g.
                // src/nested/foo becomes /project/src/nested/foo.js
                resolve(packageRoot, file),
            ])
        );
    }
    return resolve(packageRoot, './src/index.ts');
}

/**
 * @param {import('rollup').ModuleFormat} format
 * @returns {import('rollup').OutputOptions}
 */
function createOutputConfig(format) {
    if (pkg.name === '@lwc/shared') {
        const ext = format === 'es' ? 'js' : `${format}.js`;

        
        return {
            dir: 'dist',
            sourcemap: true,
            format,
            banner,
            footer,
            exports: 'named',
            esModule: true,
            preserveModules: true,
            entryFileNames: `[name].${ext}`,
        };
    }

    return {
        file: format === 'es' ? pkg.module : pkg.main,
        sourcemap: true,
        format,
        banner,
        footer,
        exports: 'named',
        esModule: true,
    };
}
