/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { vi, describe } from 'vitest';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { FeatureFlagName } from '@lwc/features/dist/types';
import { testFixtureDir, formatHTML } from '@lwc/test-utils-lwc-internals';
import { serverSideRenderComponent } from '@lwc/ssr-runtime';
import { expectedFailures } from './utils/expected-failures';
import type { CompilationMode } from '../index';

interface FixtureModule {
    tagName: string;
    default: any;
    props?: { [key: string]: any };
    features?: FeatureFlagName[];
}

vi.setConfig({ testTimeout: 10_000 /* 10 seconds */ });

vi.mock('@lwc/ssr-runtime', async () => {
    const runtime = await import('@lwc/ssr-runtime');
    try {
        runtime.setHooks({
            sanitizeHtmlContent(content: unknown) {
                return String(content);
            },
        });
    } catch (_err) {
        // Ignore error if the hook is already overridden
    }
    return runtime;
});

const SSR_MODE: CompilationMode = 'asyncYield';

async function compileFixture({ input, dirname }: { input: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled-experimental-ssr.js');

    const bundle = await rollup({
        input,
        external: ['lwc', '@lwc/ssr-runtime', 'vitest'],
        plugins: [
            lwcRollupPlugin({
                targetSSR: true,
                ssrMode: SSR_MODE,
                enableDynamicComponents: true,
                // TODO [#3331]: remove usage of lwc:dynamic in 246
                experimentalDynamicDirective: true,
                modules: [{ dir: modulesDir }],
            }),
        ],
        onwarn({ message, code }) {
            if (
                code === 'CIRCULAR_DEPENDENCY' ||
                // TODO [#4793]: fix unused imports
                code === 'UNUSED_EXTERNAL_IMPORT'
            ) {
                return;
            }
            throw new Error(message);
        },
    });

    await bundle.write({
        file: outputFile,
        format: 'esm',
        exports: 'named',
    });

    return outputFile;
}

// We will enable this for realsies once all the tests are passing, but for now having the env var avoids
// running these tests in CI while still allowing for local testing.
describe.runIf(process.env.TEST_SSR_COMPILER).concurrent('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, '../../../engine-server/src/__tests__/fixtures'),
            pattern: '**/index.js',
            expectedFailures,
        },
        async ({ filename, dirname, config }) => {
            const errorFile = config?.ssrFiles?.error ?? 'error.txt';
            const expectedFile = config?.ssrFiles?.expected ?? 'expected.html';
            // TODO [#4815]: enable all SSR v2 tests
            const shortFilename = filename.split('fixtures/')[1];
            const expectedFailure = expectedFailures.has(shortFilename);

            let compiledFixturePath;
            try {
                compiledFixturePath = await compileFixture({
                    input: filename,
                    dirname,
                });
            } catch (err: any) {
                return {
                    [errorFile]: err.message,
                    [expectedFile]: '',
                };
            }

            let module;
            try {
                module = (await import(compiledFixturePath)) as FixtureModule;
            } catch (err: any) {
                if (!expectedFailure) {
                    throw err;
                }
            }

            let result;
            try {
                result = await serverSideRenderComponent(
                    module!.tagName,
                    module!.default,
                    config?.props ?? {}
                );
            } catch (err: any) {
                return {
                    [errorFile]: err.message,
                    [expectedFile]: '',
                };
            }

            try {
                return {
                    [errorFile]: '',
                    [expectedFile]: formatHTML(result),
                };
            } catch (_err: any) {
                return {
                    [errorFile]: `Test helper could not format HTML:\n\n${result}`,
                    [expectedFile]: '',
                };
            }
        }
    );
});
