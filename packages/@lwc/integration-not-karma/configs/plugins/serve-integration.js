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
        // Assume `ctx.path` is a component file, e.g. modules/x/foo/foo.js
        modules: [{ dir: path.resolve(input, '../../..') }],
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

            // Override the LWC Rollup plugin on a per-file basis by searching for a comment
            // directive /*!WTR {...}*/ and parsing the content as JSON
            const perFileConfigStr = src.match(/\/\*!WTR\s*(.*?)\*\//)?.[1];
            const { apiVersion, nativeOnly } = perFileConfigStr ? JSON.parse(perFileConfigStr) : {};

            if (apiVersion) {
                transform = createRollupPlugin(input, { apiVersion }).transform;
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

        external: [
            '@vitest/expect',
            '@vitest/spy',
            'lwc',
            'wire-service',
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
    name: 'lwc-integration-plugin',
    async serve(ctx) {
        if (ctx.path.endsWith('.spec.js')) {
            return await transform(ctx);
        } else if (ctx.path === '/test_api_sanitizeAttribute') {
            // The test in /test/api/sanitizeAttribute makes network requests
            // The returned value doesn't matter; this is just to avoid
            // unnecessary logging output
            return '';
        }
    },
};
