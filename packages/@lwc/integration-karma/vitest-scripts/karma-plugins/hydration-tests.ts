/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { join, dirname, relative, sep } from 'node:path';
import { Script, createContext } from 'node:vm';
import { access } from 'node:fs/promises';
import { format } from 'node:util';
import { InputOption, rollup, RollupCache } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import ssr, { setHooks } from '@lwc/engine-server';
import Watcher from './Watcher.js';
import type { PathLike } from 'fs';

const context = {
    LWC: ssr,
    moduleOutput: null,
};

setHooks({
    sanitizeHtmlContent(content) {
        return content as string;
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
async function exists(path: PathLike) {
    try {
        await access(path);
        return true;
    } catch (_err) {
        return false;
    }
}

let cache: RollupCache | undefined;

async function getCompiledModule(dirName: string) {
    const bundle = await rollup({
        input: join(dirName, 'x', COMPONENT_UNDER_TEST, `${COMPONENT_UNDER_TEST}.js`),
        plugins: [
            lwcRollupPlugin({
                modules: [
                    {
                        dir: dirName,
                    },
                ],
                experimentalDynamicComponent: {
                    loader: 'test-utils',
                    // @ts-expect-error: experimentalDynamicComponent is not yet typed
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

function getSsrCode(moduleCode: string, testConfig: string) {
    const script = new Script(
        `
        ${testConfig};
        config = config || {};
        ${moduleCode};
        moduleOutput = LWC.renderComponent('x-${COMPONENT_UNDER_TEST}-${guid++}', Main, config.props || {});`
    );

    createContext(context);
    script.runInContext(context);

    return context.moduleOutput;
}

async function getTestModuleCode(input: InputOption) {
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

function createHCONFIG2JSPreprocessor(
    config: { basePath: any },
    logger: { create: (arg0: string) => any },
    emitter: { _fileList: { changeFile: (arg0: string, arg1: boolean) => void } }
) {
    const { basePath } = config;
    const log = logger.create('preprocessor-lwc');
    const watcher = new Watcher(config, emitter, log);

    return async (
        _content: any,
        file: { path: any },
        done: (arg0: unknown, arg1: string | null) => void
    ) => {
        const filePath = file.path;
        const suiteDir = dirname(filePath);
        // Wrap all the tests into a describe block with the file stricture name
        const describeTitle = relative(basePath, suiteDir).split(sep).join(' ');

        try {
            const { code: testCode, watchFiles: testWatchFiles } =
                await getTestModuleCode(filePath);
            const { code: componentDef, watchFiles: componentWatchFiles } =
                await getCompiledModule(suiteDir);
            // You can add an `.only` file alongside an `index.spec.js` file to make it `fdescribe()`
            const onlyFileExists = await exists(join(suiteDir, '.only'));

            const ssrOutput = getSsrCode(componentDef, testCode);

            watcher.watchSuite(filePath, testWatchFiles.concat(componentWatchFiles));
            const newContent = format(
                TEMPLATE,
                JSON.stringify(ssrOutput),
                componentDef,
                testCode,
                onlyFileExists ? 'fdescribe' : 'describe',
                JSON.stringify(describeTitle)
            );
            done(null, newContent);
        } catch (error: any) {
            const location = relative(basePath, filePath);
            log.error('Error processing “%s”\n\n%s\n', location, error.stack || error.message);

            done(error, null);
        }
    };
}

createHCONFIG2JSPreprocessor.$inject = ['config', 'logger', 'emitter'];

export default {
    'preprocessor:hydration-tests': ['factory', createHCONFIG2JSPreprocessor],
};
