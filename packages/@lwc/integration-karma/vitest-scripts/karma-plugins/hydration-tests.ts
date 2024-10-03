/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { Script, createContext } from 'node:vm';
import fs from 'node:fs/promises';
import util from 'node:util';
import { InputOption, rollup, RollupCache } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import ssr, { renderComponent } from '@lwc/engine-server';
import type { PathLike } from 'fs';
import type { Plugin } from 'vitest/config';

const context = {
    LWC: ssr,
    moduleOutput: null,
} as { LWC: typeof ssr; moduleOutput: ReturnType<typeof renderComponent> | null };

let guid = 0;
const COMPONENT_UNDER_TEST = 'main';

export const TEMPLATE = `
    function testSuite(hydrateTest) {
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
    }
    
    testSuite(window.HydrateTest);
`;

// Like `fs.existsSync` but async
export async function exists(path: PathLike) {
    try {
        await fs.access(path);
        return true;
    } catch (_err) {
        return false;
    }
}

let cache: RollupCache | undefined;

async function getCompiledModule(dirName: string) {
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

export function getSsrCode(moduleCode: string, testConfig: string) {
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

export async function getTestModuleCode(input: InputOption) {
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

export default function BrowserCommands(): Plugin {
    return {
        name: 'vitest-plugin-lwc-hydrate',
        async load(id, _options) {
            if (id.endsWith('index.spec.js')) {
                return await loadTest(id);
            }
        },
    };
}

async function loadTest(id: string) {
    const suiteDir = path.dirname(id);
    const filePath = path.join(suiteDir, 'index.spec.js');
    // Wrap all the tests into a describe block with the file stricture name
    const describeTitle = path.relative(__dirname, suiteDir).split(path.sep).join(' ');

    const [{ code: testCode }, { code: componentDef }] = await Promise.all([
        getTestModuleCode(filePath),
        getCompiledModule(suiteDir),
    ]);

    const ssrOutput = getSsrCode(componentDef, testCode);

    const onlyFileExists = await exists(path.join(suiteDir, '.only'));
    // watcher.watchSuite(filePath, testWatchFiles.concat(componentWatchFiles));
    const newContent = util.format(
        TEMPLATE,
        JSON.stringify(ssrOutput),
        componentDef,
        testCode,
        onlyFileExists ? 'describe.only' : 'describe',
        JSON.stringify(describeTitle)
    );

    return newContent;
}
