import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { DISABLE_STATIC_CONTENT_OPTIMIZATION, ENGINE_SERVER } from './options.mjs';
const lwcSsr = await (ENGINE_SERVER ? import('@lwc/engine-server') : import('@lwc/ssr-runtime'));

const ROOT_DIR = path.join(import.meta.dirname, '..');

const context = {
    LWC: lwcSsr,
    moduleOutput: null,
};

lwcSsr.setHooks({
    sanitizeHtmlContent(content) {
        return content;
    },
});

let guid = 0;
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
                    loader: 'test-utils',
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

function throwOnUnexpectedConsoleCalls(runnable, expectedConsoleCalls = {}) {
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
        runnable();
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
async function getSsrCode(moduleCode, testConfig, filename, expectedSSRConsoleCalls) {
    const script = new vm.Script(
        // FIXME: Can these IIFEs be converted to ESM imports?
        // No, vm.Script doesn't support that. But might be doable with experimental vm.Module
        `
            ${testConfig};
            config = config || {};
            ${moduleCode};
            moduleOutput = LWC.renderComponent(
                'x-${COMPONENT_UNDER_TEST}-${guid++}',
                Main,
                config.props || {},
                false,
                'sync'
            );
        `,
        { filename }
    );

    throwOnUnexpectedConsoleCalls(() => {
        vm.createContext(context);
        script.runInContext(context);
    }, expectedSSRConsoleCalls);

    return await context.moduleOutput;
}

async function getTestConfig(input) {
    const bundle = await rollup({
        input,
        external: ['lwc', 'test-utils', '@test/loader'],
    });

    const { output } = await bundle.generate({
        format: 'iife',
        globals: {
            lwc: 'LWC',
            'test-utils': 'TestUtils',
        },
        name: 'config',
    });

    const { code } = output[0];

    return code;
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
export default async function wrapHydrationTest(filePath /* .../index.spec.js */) {
    const suiteDir = path.dirname(filePath);

    // Wrap all the tests into a describe block with the file stricture name
    const describeTitle = path.relative(ROOT_DIR, suiteDir).split(path.sep).join(' ');

    const testCode = await getTestConfig(filePath);

    // Create a temporary module to evaluate the bundled code and extract config properties for test configuration
    const configModule = new vm.Script(testCode);
    const configContext = { config: {} };
    vm.createContext(configContext);
    configModule.runInContext(configContext);
    const { expectedSSRConsoleCalls, requiredFeatureFlags } = configContext.config;

    requiredFeatureFlags?.forEach((featureFlag) => {
        lwcSsr.setFeatureFlagForTest(featureFlag, true);
    });

    try {
        // You can add an `.only` file alongside an `index.spec.js` file to make it `fdescribe()`
        const onlyFileExists = await existsUp(suiteDir, '.only');

        const describeFn = onlyFileExists ? 'describe.only' : 'describe';
        const componentDefCSR = await getCompiledModule(suiteDir, false);
        const componentDefSSR = ENGINE_SERVER
            ? componentDefCSR
            : await getCompiledModule(suiteDir, true);
        const ssrOutput = await getSsrCode(
            componentDefSSR,
            testCode,
            path.join(suiteDir, 'ssr.js'),
            expectedSSRConsoleCalls
        );

        // FIXME: can we turn these IIFEs into ESM imports?
        return `
        import { runTest } from '/helpers/test-hydrate.js';
        import config from '/${filePath}?original=1';
        ${describeFn}("${describeTitle}", () => {
            it('test', async () => {
                const ssrRendered = ${JSON.stringify(ssrOutput) /* escape quotes */};
                // Component code, IIFE set as Main
                ${componentDefCSR};
                return await runTest(ssrRendered, Main, config);
            })
        });`;
    } finally {
        requiredFeatureFlags?.forEach((featureFlag) => {
            lwcSsr.setFeatureFlagForTest(featureFlag, false);
        });
    }
}
