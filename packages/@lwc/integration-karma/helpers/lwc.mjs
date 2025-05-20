import path from 'node:path';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';

import {
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    API_VERSION,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
} from './options.mjs';

// Cache reused between each compilation to speed up the compilation time.
let cache;

export default async (ctx) => {
    const input = ctx.path.slice(1); // strip leading / from URL path to get relative file path
    const suiteDir = path.dirname(input);

    // TODO [#3370]: remove experimental template expression flag
    const experimentalComplexExpressions = suiteDir.includes('template-expressions');

    const createRollupPlugin = (options) => {
        return lwcRollupPlugin({
            // Sourcemaps don't work with Istanbul coverage
            sourcemap: !process.env.COVERAGE,
            experimentalDynamicComponent: {
                loader: 'test-utils',
                strict: true,
            },
            enableDynamicComponents: true,
            enableLwcOn: true,
            experimentalComplexExpressions,
            enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
            disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
            apiVersion: API_VERSION,
            ...options,
        });
    };

    const defaultRollupPlugin = createRollupPlugin();

    const customLwcRollupPlugin = {
        ...defaultRollupPlugin,
        transform(src, id) {
            let rollupPluginToUse;

            // Override the LWC Rollup plugin to specify different options based on file name patterns.
            // This allows us to alter the API version or other compiler props on a filename-only basis.
            const apiVersion = id.match(/useApiVersion(\d+)/)?.[1];
            const nativeOnly = /\.native-only\./.test(id);
            if (apiVersion) {
                rollupPluginToUse = createRollupPlugin({
                    apiVersion: parseInt(apiVersion, 10),
                });
            } else if (nativeOnly) {
                rollupPluginToUse = createRollupPlugin({ disableSyntheticShadowSupport: true });
            } else {
                rollupPluginToUse = defaultRollupPlugin;
            }
            return rollupPluginToUse.transform.call(this, src, id);
        },
    };

    const plugins = [customLwcRollupPlugin];

    const bundle = await rollup({
        input,
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
        format: 'esm',
        // TODO: Does web-test-runner use istanbul?
        // Sourcemaps don't work with Istanbul coverage
        sourcemap: process.env.COVERAGE ? false : 'inline',

        // The engine and the test-utils is injected as UMD. This mapping defines how those modules can be
        // referenced from the window object.
        globals: {
            lwc: 'LWC',
            'wire-service': 'WireService',
            'test-utils': 'TestUtils',
        },
    });

    const { code } = output[0];
    return code;
};
