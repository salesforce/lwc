import { join } from 'node:path';
import { LWC_VERSION } from '@lwc/shared';
import { resolvePathOutsideRoot } from '../../helpers/utils.js';
import { startTimeoutMS, endTimeoutMS, getBrowsers } from './browsers.js';

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
        IS_BROWSER: true,
    });

    const browsers = getBrowsers(options);

    // WebKit on Linux (e.g. GitHub Actions) is slower; use longer timeouts in CI to avoid flaky timeouts.
    const ciTimeouts = options.CI
        ? {
              browserStartTimeout: startTimeoutMS,
              testsStartTimeout: startTimeoutMS,
              testsFinishTimeout: endTimeoutMS,
          }
        : {};

    return {
        browsers,
        browserLogs: false,
        ...ciTimeouts,
        // FIXME: Parallelism breaks tests that rely on focus/requestAnimationFrame, because they often
        // time out before they receive focus. But it also makes the full suite take 3x longer to run...
        // Potential workaround: https://github.com/modernweb-dev/web/issues/2588
        concurrency: 1,
        concurrentBrowsers: browsers.length,
        coverage: options.COVERAGE,
        coverageConfig: {
            // This is a "magic" path that ultimately points to the lwc packages
            include: ['__wds-outside-root__/1/**'],
            reporters: ['html', 'text'],
        },
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
                        /**
                         * This transformation replaces `process.env.NODE_ENV === 'test-lwc-integration'` with `true`.
                         *
                         * You might wonder why we replace the whole thing rather than just `process.env.NODE_ENV`. Well, because we need a way
                         * to test `process.env.NODE_ENV === "production"` (prod mode) vs `process.env.NODE_ENV !== "production"` (dev mode).
                         * If we replaced `process.env.NODE_ENV`, then that would be impossible.
                         *
                         * Then you might wonder why we call it "test-lwc-integration" rather than something simple like "test". Well, because
                         * "test" was already squatted by Jest, and we actually use it for Jest-specific (not WTR-specific) behavior:
                         * - https://jestjs.io/docs/environment-variables#node_env
                         * - https://github.com/search?q=repo%3Asalesforce%2Flwc%20node_env%20%3D%3D%3D%20%27test%27&type=code
                         *
                         * Then you might wonder why we don't invent our own thing like `process.env.IS_WEB_TEST_RUNNER`. Well, because we're
                         * testing the artifacts we ship in the npm package, and we can't expect our consumers to replace the string
                         * `process.env.IS_WEB_TEST_RUNNER`, although we do expect them to replace `process.env.NODE_ENV` (usually with "production").
                         *
                         * Then you might wonder why we don't just use a runtime check like `typeof __WTR_CONFIG__ !== 'undefined'`. And the reason
                         * for that is that we want WTR-specific code to be tree-shaken in prod mode. (Assuming our consumers are replacing
                         * `process.env.NODE_ENV` with "production".)
                         *
                         * So then you might wonder why we test against the same artifacts we ship, rather than testing against WTR-specific
                         * artifacts. And that's totally reasonable, but then it introduces the risk that we're not testing our "real"
                         * artifacts.
                         *
                         * So that's why this is so weird and complicated.
                         */
                        const replacee = `process.env.NODE_ENV === 'test-lwc-integration'`;
                        return ctx.body.replaceAll(
                            replacee,
                            // pad to keep things pretty
                            'true'.padEnd(replacee.length, ' ')
                        );
                    }
                },
            },
        ],
        testFramework: { config: { retries: options.CI ? 3 : 0 } },
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
