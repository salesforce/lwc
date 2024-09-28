/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This transformation is inspired from the karma-rollup-transform:
 * https://github.com/jlmakes/karma-rollup-preprocessor/blob/master/lib/index.js
 */

// import { dirname, relative, sep } from 'path';
// import { rollup, RollupCache, SourceMap } from 'rollup';

import lwcRollupPlugin, { type RollupLwcOptions } from '@lwc/rollup-plugin';

import options from '../shared/options';
const {
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    API_VERSION,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
} = options;
//import Watcher from './Watcher';

import type { Plugin } from 'vitest/config';

// function createPreprocessor(
//     config: { basePath: any },
//     emitter: { _fileList: { changeFile: (arg0: string, arg1: boolean) => void } },
//     logger: { create: (arg0: string) => any }
// ) {
//     const { basePath } = config;

//     const log = logger.create('preprocessor-lwc');
//     const watcher = new Watcher(config, emitter, log);

//     // Cache reused between each compilation to speed up the compilation time.
//     let cache: RollupCache | undefined;

//     return async (
//         content: any,
//         file: { path: string; sourceMap: SourceMap },
//         done: (arg0: unknown, arg1: string | null) => void
//     ) => {
//         const input = file.path;

//         const suiteDir = dirname(input);

//         // Wrap all the tests into a describe block with the file structure name
//         // This avoids needing to manually write `describe()` for every file.
//         // Also add an empty test because otherwise Jasmine complains about empty describe()s:
//         // https://github.com/jasmine/jasmine/pull/1742
//         const ancestorDirectories = relative(basePath, suiteDir).split(sep);
//         const intro =
//             ancestorDirectories.map((tag) => `describe("${tag}", function () {`).join('\n') +
//             `\nxit("empty test", () => { /* empty */ });\n`;
//         const outro = ancestorDirectories.map(() => `});`).join('\n');

//         // TODO [#3370]: remove experimental template expression flag
//         const experimentalComplexExpressions = suiteDir.includes('template-expressions');
//         const customLwcRollupPlugin = createCustomRollupPlugin({ experimentalComplexExpressions });

//         const plugins = [customLwcRollupPlugin];

//         try {
//             const bundle = await rollup({
//                 input,
//                 plugins,
//                 cache,

//                 // Rollup should not attempt to resolve the engine and the test utils, Karma takes care of injecting it
//                 // globally in the page before running the tests.
//                 external: ['lwc', 'wire-service', 'test-utils', '@test/loader'],

//                 onwarn(warning, warn) {
//                     // Ignore warnings from our own Rollup plugin
//                     if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
//                         warn(warning);
//                     }
//                 },
//             });

//             watcher.watchSuite(input, bundle.watchFiles);

//             cache = bundle.cache;

//             const { output } = await bundle.generate({
//                 format: 'iife',
//                 // Sourcemaps don't work with Istanbul coverage
//                 sourcemap: process.env.COVERAGE ? false : 'inline',

//                 // The engine and the test-utils is injected as UMD. This mapping defines how those modules can be
//                 // referenced from the window object.
//                 globals: {
//                     lwc: 'LWC',
//                     'wire-service': 'WireService',
//                     'test-utils': 'TestUtils',
//                 },

//                 intro,
//                 outro,
//             });

//             const { code, map } = output[0];

//             if (map) {
//                 // We need to assign the source to the original file so Karma can source map the error in the console. Add
//                 // also adding the source map inline for browser debugging.

//                 file.sourceMap = map;
//             }

//             done(null, code);
//         } catch (error: any) {
//             const location = relative(basePath, file.path);
//             log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

//             if (process.env.KARMA_MODE === 'watch') {
//                 log.error('Ignoring error in watch mode');
//                 done(null, content); // just pass the untransformed content in for now
//             } else {
//                 done(error, null);
//             }
//         }
//     };
// }

// createPreprocessor.$inject = ['config', 'emitter', 'logger'];

// export default { 'preprocessor:lwc': ['factory', createPreprocessor] };

export default function createCustomRollupPlugin(defaultOptions: RollupLwcOptions) {
    const createRollupPlugin = (options?: RollupLwcOptions) => {
        return lwcRollupPlugin({
            // Sourcemaps don't work with Istanbul coverage
            sourcemap: !process.env.COVERAGE,
            experimentalDynamicComponent: {
                loader: 'test-utils',
                // @ts-expect-error: experimentalDynamicComponent is not yet typed
                strict: true,
            },
            enableDynamicComponents: true,
            enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
            disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
            apiVersion: API_VERSION,
            ...defaultOptions,
            ...options,
        });
    };

    const defaultRollupPlugin = createRollupPlugin();

    // Override the LWC Rollup plugin to specify an API version based on the file path
    // This allows for individual components to have individual API versions
    // without needing to have a separate Rollup bundle/chunk for each one
    const rollupPluginsPerApiVersion = new Map();

    const customLwcRollupPlugin = {
        ...defaultRollupPlugin,
        resolveId(source, importer, options) {
            // @ts-expect-error: resolveId is optional
            defaultRollupPlugin.resolveId!.call(this, source, importer, options);
        },
        transform(code, id, _options) {
            let rollupPluginToUse = defaultRollupPlugin;
            const match = id.match(/useApiVersion(\d+)/);
            if (match) {
                const apiVersion = parseInt(match[1], 10);
                let perApiVersionPlugin = rollupPluginsPerApiVersion.get(apiVersion);
                if (!perApiVersionPlugin) {
                    perApiVersionPlugin = createRollupPlugin({ apiVersion });
                    rollupPluginsPerApiVersion.set(apiVersion, perApiVersionPlugin);
                }
                rollupPluginToUse = perApiVersionPlugin;
            }

            const transformToUse = rollupPluginToUse.transform!;
            // @ts-expect-error: transform is optional
            transformToUse.call(this, code, id);
        },
    } satisfies Plugin;

    return customLwcRollupPlugin;
}
