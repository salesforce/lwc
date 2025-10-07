import { join } from 'node:path';
import { LWC_VERSION } from '@lwc/shared';
import { resolvePathOutsideRoot } from '../../helpers/utils.js';
import { getBrowsers } from './browsers.js';

/**
 * We want to convert from parsed options (true/false) to a `process.env` with only strings.
 * This drops `false` values and converts everything else to a string.
 */
const envify = (obj) => {
    const clone = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val !== false) {
            clone[key] = String(val);
        }
    }
    return clone;
};
const pluck = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
const maybeImport = (file, condition) => (condition ? `await import('${file}');` : '');

/** @type {(options: typeof import('../../helpers/options.js')) => import("@web/test-runner").TestRunnerConfig} */
export default (options) => {
    /** `process.env` to inject into test environment. */
    const env = envify({
        ...pluck(options, [
            'API_VERSION',
            'DISABLE_DETACHED_REHYDRATION',
            'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
            'DISABLE_STATIC_CONTENT_OPTIMIZATION',
            'ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL',
            'ENGINE_SERVER',
            'FORCE_NATIVE_SHADOW_MODE_FOR_TEST',
            'NATIVE_SHADOW',
        ]),
        LWC_VERSION,
        NODE_ENV: options.NODE_ENV_FOR_TEST,
    });

    return {
        browsers: getBrowsers(options),
        browserLogs: false,
        // FIXME: Parallelism breaks tests that rely on focus/requestAnimationFrame, because they often
        // time out before they receive focus. But it also makes the full suite take 3x longer to run...
        // Potential workaround: https://github.com/modernweb-dev/web/issues/2588
        concurrency: 1,
        concurrentBrowsers: 3,
        nodeResolve: true,
        rootDir: join(import.meta.dirname, '../..'),
        plugins: [
            {
                name: 'lwc-base-plugin',
                resolveImport({ source }) {
                    if (source === 'wire-service') {
                        return resolvePathOutsideRoot('../wire-service/dist/index.js');
                    }
                },
                async transform(ctx) {
                    if (ctx.type === 'application/javascript') {
                        // FIXME: copy/paste Nolan's spiel about why we do this ugly thing
                        return ctx.body.replace(
                            /process\.env\.NODE_ENV === 'test-lwc-integration'/g,
                            'true'
                        );
                    }
                },
            },
        ],
        testRunnerHtml: (testFramework) =>
            `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="module">
            globalThis.process = ${JSON.stringify({ env })};
            globalThis.lwcRuntimeFlags = ${JSON.stringify(
                pluck(options, [
                    'DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE',
                    'DISABLE_DETACHED_REHYDRATION',
                ])
            )};

            ${maybeImport('@lwc/synthetic-shadow', !options.NATIVE_SHADOW)}
            ${maybeImport('@lwc/aria-reflection', options.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL)}
            </script>
            <script type="module" src="./helpers/setup.js"></script>
            <script type="module" src="${testFramework}"></script>
          </head>
        </html>
        `,
    };
};
