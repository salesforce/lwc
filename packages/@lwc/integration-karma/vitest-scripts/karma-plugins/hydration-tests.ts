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
import MagicString from 'magic-string';
import type { PathLike } from 'fs';
import type { Plugin } from 'vitest/config';

try {
    ssr.setHooks({
        sanitizeHtmlContent: (content) => `${content}`,
    });
} catch (_e) {
    // ignore
}

const context = {
    LWC: ssr,
    moduleOutput: null as string | null,
} as const satisfies vm.Context;

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
        compact: true,
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
        compact: true,
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

    try {
        script.runInContext(context, { displayErrors: true, filename });
    } catch (error) {
        return error;
    }

    return context.moduleOutput;
}

export default function vitestPluginLwcHydrate(): Plugin {
    return {
        name: 'vitest-plugin-lwc-hydrate',
        enforce: 'pre',
        config(config) {
            if (!config.test) {
                throw new Error('Expected test configuration');
            }

            if (!config.test.browser) {
                throw new Error('Expected browser configuration');
            }

            config.test.browser.testerScripts = config.test.browser.testerScripts || [];

            if (process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION) {
                config.test.browser.testerScripts.push({
                    src: '@lwc/synthetic-shadow/dist/index.js?iife',
                });
            }

            return config;
        },
        shouldTransformCachedModule(_options) {
            return true;
        },

        async transform(code, id, _options) {
            if (id.endsWith('index.spec.js')) {
                const suiteDir = path.dirname(id);
                // Wrap all the tests into a describe block with the file stricture name
                const describeTitle = path.relative(basePath, suiteDir).split(path.sep).join(' ');

                const [testOutput, moduleOutput] = await Promise.all([
                    getTestModuleCode(id),
                    getCompiledModule(suiteDir),
                ]);

                for (const file of moduleOutput.watchFiles) {
                    this.addWatchFile(file);
                }
                for (const file of testOutput.watchFiles) {
                    this.addWatchFile(file);
                }

                const magicString = new MagicString(testOutput.code, {
                    filename: id,
                });

                const ssrOutput = getSsrCode(id, testOutput.code, moduleOutput.code);
                const ssrRendered = JSON.stringify(ssrOutput);

                if (ssrOutput instanceof Error) {
                    const serializedError = JSON.stringify(
                        ssrOutput,
                        Object.getOwnPropertyNames(ssrOutput)
                    );
                    magicString.prepend(`const error = ${serializedError};`);
                } else {
                    magicString.prepend(`const error = null;`);
                }

                magicString.prepend(`const ssrRendered = ${ssrRendered};`);
                magicString.prepend(`${moduleOutput.code};`);
                magicString.prepend(`import { runTest } from 'test-hydrate';`);
                magicString.prepend(`import { expect } from 'vitest';`);
                magicString.append(
                    `it('${describeTitle}', () => { return runTest(ssrRendered, Main, config, error); });`
                );

                const code = magicString.toString();
                const map = magicString.generateMap({ hires: true });

                return {
                    code,
                    map,
                };
            }
        },
    };
}
