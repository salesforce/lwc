import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';

import {
    API_VERSION,
    COVERAGE,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
} from '../../helpers/options.js';

/** Cache reused between each compilation to speed up the compilation time. */
let cache;

const createRollupPlugin = (input, options) => {
    const suiteDir = path.dirname(input);

    // TODO [#3370]: remove experimental template expression flag
    const experimentalComplexExpressions = suiteDir.includes('template-expressions');

    return lwcRollupPlugin({
        // Sourcemaps don't work with Istanbul coverage
        sourcemap: !process.env.COVERAGE,
        experimentalDynamicComponent: {
            loader: fileURLToPath(new URL('../../helpers/dynamic-loader', import.meta.url)),
            strict: true,
        },
        enableDynamicComponents: true,
        enableLwcOn: true,
        experimentalComplexExpressions,
        enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
        disableSyntheticShadowSupport: DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
        apiVersion: API_VERSION,
        modules: [
            {
                // Assume `ctx.path` is a component file, e.g. modules/x/foo/foo.js
                dir: path.resolve(input, '../../..'),
            },
        ],
        ...options,
    });
};

const transform = async (ctx) => {
    const input = ctx.path.slice(1); // strip leading / from URL path to get relative file path

    const defaultRollupPlugin = createRollupPlugin(input);

    const customLwcRollupPlugin = {
        ...defaultRollupPlugin,
        transform(src, id) {
            let transform;

            // Override the LWC Rollup plugin to specify different options based on file name patterns.
            // This allows us to alter the API version or other compiler props on a filename-only basis.
            const apiVersion = id.match(/useApiVersion(\d+)/)?.[1];
            const nativeOnly = /\.native-only\./.test(id);
            if (apiVersion) {
                // The original Karma tests only ever had filename-based config for API version 60.
                // Filename-based config is a pattern we want to move away from, so this transform
                // only works for that version, so that we could simplify the logic here.
                if (apiVersion !== '60') {
                    throw new Error(
                        'TODO: fully implement or remove support for filename-based API version'
                    );
                }
                transform = createRollupPlugin(input, {
                    apiVersion: 60,
                }).transform;
            } else if (nativeOnly) {
                transform = createRollupPlugin(input, {
                    disableSyntheticShadowSupport: true,
                }).transform;
            } else {
                transform = defaultRollupPlugin.transform;
            }
            return transform.call(this, src, id);
        },
    };

    const bundle = await rollup({
        input,
        cache,
        plugins: [customLwcRollupPlugin],

        // Rollup should not attempt to resolve the engine and the test utils, Karma takes care of injecting it
        // globally in the page before running the tests.
        external: [
            'lwc',
            'wire-service',
            '@test/loader',
            // Some helper files export functions that mutate a global state. The setup file calls
            // some of those functions and does not get bundled. Including the helper files in the
            // bundle would create a separate global state, causing tests to fail. We don't need to
            // mark _all_ helpers as external, but we do anyway for ease of maintenance.
            /\/helpers\/\w+\.js$/,
        ],

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
        // FIXME: Does web-test-runner use istanbul?
        // Sourcemaps don't work with Istanbul coverage
        sourcemap: COVERAGE ? false : 'inline',
    });

    return output[0].code;
};

/** @type {import('@web/dev-server-core').Plugin} */
export default {
    async serve(ctx) {
        if (ctx.path.endsWith('.spec.js')) {
            return await transform(ctx);
        }
    },
};
