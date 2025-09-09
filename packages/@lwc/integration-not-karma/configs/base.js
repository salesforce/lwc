import { join } from 'node:path';
import { LWC_VERSION } from '@lwc/shared';
import { importMapsPlugin } from '@web/dev-server-import-maps';
import * as options from '../helpers/options.js';

const pluck = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
const maybeImport = (file, condition) => (condition ? `await import('${file}');` : '');

/** `process.env` to inject into test environment. */
const env = {
    ...pluck(options, [
        'API_VERSION',
        'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
        'DISABLE_STATIC_CONTENT_OPTIMIZATION',
        'DISABLE_SYNTHETIC',
        'ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL',
        'ENGINE_SERVER',
        'FORCE_NATIVE_SHADOW_MODE_FOR_TEST',
        'NATIVE_SHADOW',
    ]),
    LWC_VERSION,
    NODE_ENV: options.NODE_ENV_FOR_TEST,
};

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    // FIXME: Parallelism breaks tests that rely on focus/requestAnimationFrame, because they often
    // time out before they receive focus. But it also makes the full suite take 3x longer to run...
    // Potential workaround: https://github.com/modernweb-dev/web/issues/2588
    concurrency: 1,
    filterBrowserLogs: () => false,
    nodeResolve: true,
    rootDir: join(import.meta.dirname, '..'),
    plugins: [
        importMapsPlugin({ inject: { importMap: { imports: { lwc: './mocks/lwc.js' } } } }),
        {
            resolveImport({ source }) {
                if (source === 'wire-service') {
                    // To serve files outside the web root (e.g. node_modules in the monorepo root),
                    // @web/dev-server provides this "magic" path. It's hacky of us to use it directly.
                    // `/__wds-outside-root__/${depth}/` === '../'.repeat(depth)
                    return '/__wds-outside-root__/1/wire-service/dist/index.js';
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
          <head>
            <!-- scripts are included in the head so that the body can be fully reset between tests -->
            <script type="module">
            globalThis.process = ${JSON.stringify({ env })};
            globalThis.lwcRuntimeFlags = ${JSON.stringify(
                pluck(options, ['DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE'])
            )};

            ${maybeImport('@lwc/synthetic-shadow', !options.DISABLE_SYNTHETIC)}
            ${maybeImport('@lwc/aria-reflection', options.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL)}
            </script>
            <script type="module" src="./helpers/setup.js"></script>
            <script type="module" src="${testFramework}"></script>
          </head>
        </html>`,
};
