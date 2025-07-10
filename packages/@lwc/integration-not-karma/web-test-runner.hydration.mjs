import { LWC_VERSION } from '@lwc/shared';
import * as options from './helpers/options.mjs';
import wrapHydrationTest from './helpers/hydration-tests.mjs';

const pluck = (obj, keys) => Object.fromEntries(keys.map((k) => [k, Boolean(obj[k])]));

/** `process.env` to inject into test environment. */
const env = {
    ...pluck(options, [
        'API_VERSION',
        'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
        'DISABLE_STATIC_CONTENT_OPTIMIZATION',
        'DISABLE_SYNTHETIC',
        'ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL',
        'ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION',
        'ENGINE_SERVER',
        'FORCE_NATIVE_SHADOW_MODE_FOR_TEST',
        'NATIVE_SHADOW',
    ]),
    LWC_VERSION,
    NODE_ENV: options.NODE_ENV_FOR_TEST,
};
/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    files: [
        // FIXME: These tests are just symlinks to integration-karma for now so the git diff smaller
        'test-hydration/**/*.spec.js',
        '!test-hydration/light-dom/scoped-styles/replace-scoped-styles-with-dynamic-templates/index.spec.js',
    ],
    nodeResolve: true,
    rootDir: import.meta.dirname,
    plugins: [
        {
            resolveImport({ source }) {
                if (source === 'test-utils') {
                    return '/helpers/utils.mjs';
                } else if (source === 'wire-service') {
                    return '@lwc/wire-service';
                }
            },
            async serve(ctx) {
                // Hydration test "index.spec.js" files are actually just config files.
                // They don't directly define the tests. Instead, when we request the file,
                // we wrap it with some boilerplate. That boilerplate must include the config
                // file we originally requested, so the ?original query parameter is used
                // to return the file unmodified.
                if (ctx.path.endsWith('.spec.js') && !ctx.query.original) {
                    return await wrapHydrationTest(ctx.path.slice(1)); // remove leading /
                }
            },
            async transform(ctx) {
                if (ctx.type === 'application/javascript') {
                    // FIXME: copy/paste Nolan's spiel about why we do this ugly thing
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
            globalThis.lwcRuntimeFlags = ${JSON.stringify(
                pluck(options, ['DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE'])
            )};
            </script>
            <script type="module" src="./helpers/setup.mjs"></script>
            <script type="module" src="${testFramework}"></script>
          </body>
        </html>`,
};
