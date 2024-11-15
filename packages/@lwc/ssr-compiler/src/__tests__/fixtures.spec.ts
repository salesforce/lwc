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
        onwarn({ message, code, names }) {
            if (code === 'CIRCULAR_DEPENDENCY') {
                return;
            }
            // TODO [#4793]: fix unused imports
            if (code === 'UNUSED_EXTERNAL_IMPORT') {
                const unexpected = new Set(names);
                const expected = ['connectContext', 'htmlEscape', 'track'];
                expected.forEach((name) => unexpected.delete(name));
                if (unexpected.size === 0) return;
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

const testFixtures = testFixtureDir(
    {
        root: path.resolve(__dirname, '../../../engine-server/src/__tests__/fixtures'),
        pattern: '**/index.js',
        ignore: ['**/inner-outer-html/index.js', '**/lwc-dynamic/index.js'],
    },
    async ({ filename, dirname, config }) => {
        let compiledFixturePath;
        try {
            compiledFixturePath = await compileFixture({
                input: filename,
                dirname,
            });
        } catch (error) {
            return { error };
        }

        const module = (await import(compiledFixturePath)) as FixtureModule;

        try {
            return {
                result: await serverSideRenderComponent(
                    module.tagName,
                    module.default,
                    config?.props ?? {},
                    SSR_MODE
                ),
            };
        } catch (error) {
            return { error };
        }
    }
);

// We will enable this for realsies once all the tests are passing, but for now having the env var avoids
// running these tests in CI while still allowing for local testing.
describe.runIf(process.env.TEST_SSR_COMPILER).concurrent('fixtures', async () => {
    await testFixtures({
        'expected.html': ({ result }) => (result ? formatHTML(result) : ''),
        'error.txt': ({ error }) => (error ? (error as any).message : ''),
        // TODO [#4815]: enable all SSR v2 tests
        expectedFailures,
    });
});
