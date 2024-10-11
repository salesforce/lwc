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

import path from 'node:path';
import { rollup, type RollupCache } from 'rollup';
import lwcRollupPlugin, { type RollupLwcOptions } from '@lwc/rollup-plugin';

import { DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER, API_VERSION } from '../shared/options';

import type { Plugin as VitestPlugin } from 'vitest/config';

export default function lwcPreprocessor(): VitestPlugin {
    let cache: RollupCache | undefined;

    const filter = (id: string) => id.endsWith('.spec.js');

    return {
        name: 'vitest-plugin-lwc-preprocessor',
        enforce: 'pre',
        async transform(_code, id) {
            if (!filter(id)) {
                return;
            }

            const suiteDir = path.dirname(id);

            // TODO [#3370]: remove experimental template expression flag
            const experimentalComplexExpressions = suiteDir.includes('template-expressions');

            const createRollupPlugin = (options?: RollupLwcOptions) => {
                return lwcRollupPlugin({
                    // Sourcemaps don't work with Istanbul coverage
                    sourcemap: !process.env.COVERAGE,
                    experimentalDynamicComponent: {
                        loader: 'test-utils',
                        // @ts-expect-error experimentalDynamicComponent is not defined
                        strict: true,
                    },
                    enableDynamicComponents: true,
                    experimentalComplexExpressions,
                    enableStaticContentOptimization:
                        !process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION,
                    disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
                    apiVersion: API_VERSION,
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
                transform(src: any, id: string) {
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
                    // @ts-expect-error transform is not defined
                    const { code, map } = rollupPluginToUse.transform!.call(this, src, id);

                    return {
                        code: code.replace('/*LWC compiler v', '/*!/*LWC compiler v'),
                        map,
                    };
                },
            };

            const plugins = [customLwcRollupPlugin];

            const bundle = await rollup({
                input: id,
                plugins,
                cache,

                // Rollup should not attempt to resolve the engine and the test utils, Karma takes care of injecting it
                // globally in the page before running the tests.
                external: ['lwc', 'wire-service', 'test-utils', '@test/loader'],

                onwarn(warning, warn) {
                    // Ignore warnings from our own Rollup plugin
                    if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                        warn(warning);
                    }
                },
            });

            cache = bundle.cache;

            const { output } = await bundle.generate({
                format: 'iife',
                // Sourcemaps don't work with Istanbul coverage
                sourcemap: process.env.COVERAGE ? false : 'inline',

                // The engine and the test-utils is injected as UMD. This mapping defines how those modules can be
                // referenced from the window object.
                globals: {
                    lwc: 'LWC',
                    'wire-service': 'WireService',
                    'test-utils': 'TestUtils',
                },

                // intro,
                // outro,
            });

            const { code, map } = output[0];

            return {
                code: code.replace('/*LWC compiler v', '/*!/*LWC compiler v'),
                map,
            };
        },
    };
}
