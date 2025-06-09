import { HIGHEST_API_VERSION, LWC_VERSION } from '@lwc/shared';
import customRollup from './helpers/lwc.mjs';

const pluck = (obj, keys) => Object.fromEntries(keys.map((k) => [k, Boolean(obj[k])]));

const env = {
    API_VERSION: Number(process.env.API_VERSION) || HIGHEST_API_VERSION,
    LWC_VERSION,
    NATIVE_SHADOW: Boolean(
        process.env.DISABLE_SYNTHETIC || process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST
    ),
    NODE_ENV: process.env.NODE_ENV_FOR_TEST || 'development',
    ...pluck(process.env, [
        'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
        'DISABLE_STATIC_CONTENT_OPTIMIZATION',
        'DISABLE_SYNTHETIC',
        'ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL',
        'ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION',
        'ENGINE_SERVER',
        'FORCE_NATIVE_SHADOW_MODE_FOR_TEST',
    ]),
};

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    files: ['test/**/*.spec.js'],
    nodeResolve: true,
    rootDir: import.meta.dirname,
    plugins: [
        {
            resolveImport({ source }) {
                if (source === 'test-utils') {
                    return '/helpers/wtr-utils.mjs';
                } else if (source === 'wire-service') {
                    return '@lwc/wire-service';
                }
            },
            async serve(ctx) {
                if (ctx.path.endsWith('.spec.js')) {
                    return await customRollup(ctx);
                }
            },
            async transform(ctx) {
                if (ctx.type === 'application/javascript') {
                    return ctx.body.replace(/process\.env\.NODE_ENV === 'test-karma-lwc'/g, 'true');
                }
            },
        },
    ],
    testRunnerHtml: (testFramework) =>
        `<!DOCTYPE html>
        <html>
          <body>
            <script type="module">
            globalThis.process = ${JSON.stringify({ env })};
            globalThis.lwcRuntimeFlags = ${JSON.stringify({
                DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE:
                    env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
            })};
            </script>
            <script type="module" src="./helpers/setup.mjs"></script>
            <script type="module" src="./helpers/wtr-utils.mjs"></script>
            <script type="module" src="${testFramework}"></script>
          </body>
        </html>`,
};
