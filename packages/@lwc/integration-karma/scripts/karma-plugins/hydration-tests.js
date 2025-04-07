/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const ENGINE_SERVER = process.env.ENGINE_SERVER;
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs/promises');
const { format } = require('node:util');
const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const ssr = ENGINE_SERVER ? require('@lwc/engine-server') : require('@lwc/ssr-runtime');
const { DISABLE_STATIC_CONTENT_OPTIMIZATION } = require('../shared/options');
const Watcher = require('./Watcher');

const context = {
    LWC: ssr,
    moduleOutput: null,
};

ssr.setHooks({
    sanitizeHtmlContent(content) {
        return content;
    },
});

let guid = 0;
const COMPONENT_UNDER_TEST = 'main';

const TEMPLATE = `
    (function (hydrateTest) {
        const ssrRendered = %s;
        // Component code, set as Main
        %s;
        // Test config, set as config
        %s;
        
        %s(%s, () => {
            it('test', () => {
                return hydrateTest.runTest(ssrRendered, Main, config);
            })
        });
    })(window.HydrateTest);
`;

// Like `fs.existsSync` but async
async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (_err) {
        return false;
    }
}

async function getCompiledModule(dirName, compileForSSR) {
    const bundle = await rollup({
        input: path.join(dirName, 'x', COMPONENT_UNDER_TEST, `${COMPONENT_UNDER_TEST}.js`),
        plugins: [
            lwcRollupPlugin({
                targetSSR: !!compileForSSR,
                modules: [
                    {
                        dir: dirName,
                    },
                ],
                experimentalDynamicComponent: {
                    loader: 'test-utils',
                    strict: true,
                },
                enableDynamicComponents: true,
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

    const { watchFiles } = bundle;

    const { output } = await bundle.generate({
        format: 'iife',
        name: 'Main',
        globals: {
            lwc: 'LWC',
            '@lwc/ssr-runtime': 'LWC',
            'test-utils': 'TestUtils',
        },
    });

    const { code } = output[0];

    return { code, watchFiles };
}

function throwOnUnexpectedConsoleCalls(runnable) {
    // The console is shared between the VM and the main realm. Here we ensure that known warnings
    // are ignored and any others cause an explicit error.
    const methods = ['error', 'warn', 'log', 'info'];
    const originals = {};
    for (const method of methods) {
        originals[method] = console[method];
        console[method] = function (error) {
            if (
                method === 'warn' &&
                // This is a false positive due to RegExp.prototype.test
                // eslint-disable-next-line vitest/no-conditional-tests
                /Cannot set property "(inner|outer)HTML"/.test(error?.message)
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
 * new value (the rendered markup) to the globalThis.moduleOutput, which correspond to
 * context.moduleOutput in the hydration-test.js module scope.
 *
 * So, script runs, generates markup, & we get that markup out and return it to Karma for use
 * in client-side tests.
 */
async function getSsrCode(moduleCode, testConfig, filename) {
    const script = new vm.Script(
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
        );`,
        { filename }
    );

    throwOnUnexpectedConsoleCalls(() => {
        vm.createContext(context);
        script.runInContext(context);
    });
    return context.moduleOutput;
}

async function getTestModuleCode(input) {
    const bundle = await rollup({
        input,
        external: ['lwc', 'test-utils', '@test/loader'],
    });

    const { watchFiles } = bundle;

    const { output } = await bundle.generate({
        format: 'iife',
        globals: {
            lwc: 'LWC',
            'test-utils': 'TestUtils',
        },
        name: 'config',
    });

    const { code } = output[0];

    return { code, watchFiles };
}

async function existsUp(dir, file) {
    while (true) {
        if (await exists(path.join(dir, file))) return true;
        dir = path.join(dir, '..');
        const basename = path.basename(dir);
        // We should always hit __tests__, but check for system root as an escape hatch
        if (basename === '__tests__' || basename === '') return false;
    }
}

function createHCONFIG2JSPreprocessor(config, logger, emitter) {
    const { basePath } = config;
    const log = logger.create('preprocessor-lwc');
    const watcher = new Watcher(config, emitter, log);

    return async (_content, file, done) => {
        const filePath = file.path;
        const suiteDir = path.dirname(filePath);

        // Wrap all the tests into a describe block with the file stricture name
        const describeTitle = path.relative(basePath, suiteDir).split(path.sep).join(' ');

        try {
            const { code: testCode, watchFiles: testWatchFiles } =
                await getTestModuleCode(filePath);

            // You can add an `.only` file alongside an `index.spec.js` file to make it `fdescribe()`
            const onlyFileExists = await existsUp(suiteDir, '.only');

            const describe = onlyFileExists ? 'fdescribe' : 'describe';

            const { code: componentDefCSR, watchFiles: componentWatchFilesCSR } =
                await getCompiledModule(suiteDir, false);

            let ssrOutput;

            if (ENGINE_SERVER) {
                // engine-server uses the same def as the client
                watcher.watchSuite(filePath, testWatchFiles.concat(componentWatchFilesCSR));
                ssrOutput = await getSsrCode(
                    componentDefCSR,
                    testCode,
                    path.join(suiteDir, 'ssr.js')
                );
            } else {
                // ssr-compiler has it's own def
                const { code: componentDefSSR, watchFiles: componentWatchFilesSSR } =
                    await getCompiledModule(suiteDir, true);
                watcher.watchSuite(
                    filePath,
                    testWatchFiles.concat(componentWatchFilesCSR).concat(componentWatchFilesSSR)
                );
                ssrOutput = await getSsrCode(
                    componentDefSSR.replace(`process.env.NODE_ENV === 'test-karma-lwc'`, 'true'),
                    testCode,
                    path.join(suiteDir, 'ssr.js')
                );
            }

            const newContent = format(
                TEMPLATE,
                JSON.stringify(ssrOutput),
                componentDefCSR,
                testCode,
                describe,
                JSON.stringify(describeTitle)
            );
            done(null, newContent);
        } catch (error) {
            const location = path.relative(basePath, filePath);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);
            done(error, null);
        }
    };
}

createHCONFIG2JSPreprocessor.$inject = ['config', 'logger', 'emitter'];

module.exports = {
    'preprocessor:hydration-tests': ['factory', createHCONFIG2JSPreprocessor],
};
