import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { DISABLE_STATIC_CONTENT_OPTIMIZATION, ENGINE_SERVER } from '../../helpers/options.js';
/** LWC SSR module to use when server-side rendering components. */
const lwcSsr = await (ENGINE_SERVER
    ? // Using import('literal') rather than import(variable) so static analysis tools work
      import('@lwc/engine-server')
    : import('@lwc/ssr-runtime'));

lwcSsr.setHooks({
    sanitizeHtmlContent(content) {
        return content;
    },
});

const ROOT_DIR = path.join(import.meta.dirname, '../..');

const COMPONENT_UNDER_TEST = 'main';

// Like `fs.existsSync` but async
async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (_err) {
        return false;
    }
}

async function getCompiledModule(dir, compileForSSR) {
    const bundle = await rollup({
        input: path.join(dir, 'x', COMPONENT_UNDER_TEST, `${COMPONENT_UNDER_TEST}.js`),
        plugins: [
            lwcRollupPlugin({
                targetSSR: !!compileForSSR,
                modules: [{ dir: path.join(ROOT_DIR, dir) }],
                experimentalDynamicComponent: {
                    loader: fileURLToPath(new URL('../../helpers/loader.js', import.meta.url)),
                    strict: true,
                },
                enableDynamicComponents: true,
                enableLwcOn: true,
                enableStaticContentOptimization: !DISABLE_STATIC_CONTENT_OPTIMIZATION,
                experimentalDynamicDirective: true,
            }),
        ],

        external: ['lwc', '@lwc/ssr-runtime', 'test-utils', '@test/loader'], // @todo: add ssr modules for test-utils and @test/loader

        onwarn(warning, warn) {
            // Ignore warnings from our own Rollup plugin
            if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                warn(warning);
            }
        },
    });

    const { output } = await bundle.generate({
        format: 'iife',
        name: 'Main',
        globals: {
            lwc: 'LWC',
            '@lwc/ssr-runtime': 'LWC',
            'test-utils': 'TestUtils',
        },
    });

    return output[0].code;
}

async function throwOnUnexpectedConsoleCalls(runnable, expectedConsoleCalls = {}) {
    // The console is shared between the VM and the main realm. Here we ensure that known warnings
    // are ignored and any others cause an explicit error.
    const methods = ['error', 'warn', 'log', 'info'];
    const originals = {};
    for (const method of methods) {
        // eslint-disable-next-line no-console
        originals[method] = console[method];
        // eslint-disable-next-line no-console
        console[method] = function (error) {
            if (
                method === 'warn' &&
                // This eslint warning is a false positive due to RegExp.prototype.test
                // eslint-disable-next-line vitest/no-conditional-tests
                /Cannot set property "(inner|outer)HTML"/.test(error?.message)
            ) {
                return;
            } else if (
                expectedConsoleCalls[method]?.some((matcher) => error.message.includes(matcher))
            ) {
                return;
            }

            throw new Error(`Unexpected console.${method} call: ${error}`);
        };
    }
    try {
        return await runnable();
    } finally {
        Object.assign(console, originals);
    }
}

/**
 * This is the function that takes SSR bundle code and test config, constructs a script that will
 * run in a separate JS runtime environment with its own global scope. The `context` object
 * (defined at the top of this file) is passed in as the global scope for that script. The script
 * runs, utilizing the `LWC` object that we've attached to the global scope, it sets a
 * new value (the rendered markup) to `globalThis.moduleOutput`, which corresponds to
 * `context.moduleOutput in this file's scope.
 *
 * So, script runs, generates markup, & we get that markup out and return it for use
 * in client-side tests.
 */
async function getSsrCode(moduleCode, filePath, expectedSSRConsoleCalls) {
    // LWC itself requires configuration before each test (`setHooks` and
    // `setFeatureFlagForTest`). Ideally, this would be done in pure isolation,
    // but getting that set up for `vm.Script`/`vm.Module` is non-trivial.
    // Instead, we inject a shared LWC that gets configured outside the script.
    const script = new vm.Script(
        `(async () => {
            const {default: config} = await import('./${filePath}');
            ${moduleCode /* var Main = ... */}
            return LWC.renderComponent(
                'x-${COMPONENT_UNDER_TEST}',
                Main,
                config.props || {},
                false,
                'sync'
            );
        })()`,
        {
            filename: `[SSR] ${filePath}`,
            importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
        }
    );

    return await throwOnUnexpectedConsoleCalls(
        () => script.runInContext(vm.createContext({ LWC: lwcSsr })),
        expectedSSRConsoleCalls
    );
}

async function existsUp(dir, file) {
    while (true) {
        if (await exists(path.join(dir, file))) return true;
        dir = path.join(dir, '..');
        const basename = path.basename(dir);
        if (basename === '.') return false;
    }
}

/**
 * Hydration test `index.spec.js` files are actually config files, not spec files.
 * This function wraps those configs in the test code to be executed.
 */
async function wrapHydrationTest(filePath) {
    const {
        default: { expectedSSRConsoleCalls, requiredFeatureFlags },
    } = await import(path.join(ROOT_DIR, filePath));

    try {
        requiredFeatureFlags?.forEach((featureFlag) => {
            lwcSsr.setFeatureFlagForTest(featureFlag, true);
        });

        const suiteDir = path.dirname(filePath);
        // You can add an `.only` file alongside an `index.spec.js` file to make it `fdescribe()`
        const onlyFileExists = await existsUp(suiteDir, '.only');

        const componentDefCSR = await getCompiledModule(suiteDir, false);
        const componentDefSSR = ENGINE_SERVER
            ? componentDefCSR
            : await getCompiledModule(suiteDir, true);
        const ssrOutput = await getSsrCode(componentDefSSR, filePath, expectedSSRConsoleCalls);

        // FIXME: can we turn these IIFEs into ESM imports?
        return `
        import * as LWC from 'lwc';
        import { runTest } from '/helpers/test-hydrate.js';
        import config from '/${filePath}?original=1';
        ${onlyFileExists ? 'it.only' : 'it'}('${filePath}', async () => {
            const ssrRendered = ${JSON.stringify(ssrOutput) /* escape quotes */};
            // Component code, IIFE set as Main
            ${componentDefCSR};
            return await runTest(ssrRendered, Main, config);
        });
        `;
    } finally {
        requiredFeatureFlags?.forEach((featureFlag) => {
            lwcSsr.setFeatureFlagForTest(featureFlag, false);
        });
    }
}

/** @type {import('@web/dev-server-core').Plugin} */
export default {
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
};
