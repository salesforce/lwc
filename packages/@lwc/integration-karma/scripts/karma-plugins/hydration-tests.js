/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const vm = require('vm');
const { format } = require('util');
const { rollup } = require('rollup');
const lwcRollupPlugin = require('@lwc/rollup-plugin');
const ssr = require('@lwc/engine-server');
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
        
        describe(%s, () => {
            it('test', () => {
                return hydrateTest.runTest(ssrRendered, Main, config);
            })
        });
    })(window.HydrateTest);
`;

let cache;

async function getCompiledModule(dirName) {
    const bundle = await rollup({
        input: path.join(dirName, 'x', COMPONENT_UNDER_TEST, `${COMPONENT_UNDER_TEST}.js`),
        plugins: [
            lwcRollupPlugin({
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
            }),
        ],
        cache,

        external: ['lwc', 'test-utils', '@test/loader'], // @todo: add ssr modules for test-utils and @test/loader

        onwarn(warning, warn) {
            // Ignore warnings from our own Rollup plugin
            if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                warn(warning);
            }
        },
    });

    const { watchFiles } = bundle;
    cache = bundle.cache;

    const { output } = await bundle.generate({
        format: 'iife',
        name: 'Main',
        globals: {
            lwc: 'LWC',
            'test-utils': 'TestUtils',
        },
    });

    const { code } = output[0];

    return { code, watchFiles };
}

function getSsrCode(moduleCode, testConfig) {
    const script = new vm.Script(
        `
        ${testConfig};
        config = config || {};
        ${moduleCode};
        moduleOutput = LWC.renderComponent('x-${COMPONENT_UNDER_TEST}-${guid++}', Main, config.props || {});`
    );

    vm.createContext(context);
    script.runInContext(context);

    return context.moduleOutput;
}

async function getTestModuleCode(input) {
    const bundle = await rollup({
        input,
        external: ['lwc', 'test-utils', '@test/loader'],
    });

    const { watchFiles } = bundle;
    cache = bundle.cache;

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
            const { code: testCode, watchFiles: testWatchFiles } = await getTestModuleCode(
                filePath
            );
            const { code: componentDef, watchFiles: componentWatchFiles } = await getCompiledModule(
                suiteDir
            );

            const ssrOutput = getSsrCode(componentDef, testCode);

            watcher.watchSuite(filePath, testWatchFiles.concat(componentWatchFiles));
            const newContent = format(
                TEMPLATE,
                JSON.stringify(ssrOutput),
                componentDef,
                testCode,
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
