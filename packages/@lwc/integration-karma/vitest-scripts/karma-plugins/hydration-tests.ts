/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { InputOption, rollup, RollupCache } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import ssr from '@lwc/engine-server';
import type { PathLike } from 'fs';
import type { Plugin } from 'vitest/config';

try {
    ssr.setHooks({
        sanitizeHtmlContent: (content) => `${content}`,
    });
} catch (_e) {
    // ignore
}

const context: vm.Context = {
    LWC: ssr,
    moduleOutput: null,
};

let guid = 0;

const COMPONENT_UNDER_TEST = 'main';

const basePath = path.resolve(__dirname, '../../test-hydration');

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

function getSsrCode(filename: string, moduleCode: string, testConfig: string) {
    const script = new vm.Script(
        `
        ${testConfig};
        config = config || {};
        ${moduleCode};
        moduleOutput = LWC.renderComponent('x-${COMPONENT_UNDER_TEST}-${guid++}', Main, config.props || {});`,
        { filename }
    );

    vm.createContext(context);
    script.runInContext(context);

    return context.moduleOutput;
}

async function loadTest(filePath: string) {
    const suiteDir = path.dirname(filePath);
    // Wrap all the tests into a describe block with the file stricture name
    const describeTitle = path.relative(basePath, suiteDir).split(path.sep).join(' ');

    const [{ code: testCode }, { code: componentDef }] = await Promise.all([
        getTestModuleCode(filePath),
        getCompiledModule(suiteDir),
    ]);

    const ssrOutput = getSsrCode(filePath, componentDef, testCode);

    const ssrRendered = JSON.stringify(ssrOutput);

    return `
import { runTest } from 'test-hydrate';

const ssrRendered = ${ssrRendered};
// Component code, set as Main
${componentDef};
// Test config, set as config
${testCode};

it('${describeTitle}', () => {
    return runTest(ssrRendered, Main, config);
});
    `;
}

export default function vitestPluginLwcHydrate(): Plugin {
    return {
        name: 'vitest-plugin-lwc-hydrate',
        async load(id, _options) {
            if (id.endsWith('index.spec.js')) {
                return await loadTest(id);
            }
        },
    };
}
