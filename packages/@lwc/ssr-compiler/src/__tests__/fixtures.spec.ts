/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'node:path';
import { vi } from 'vitest';
import { rollup, RollupLog } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { FeatureFlagName } from '@lwc/features/dist/types';
import { formatHTML, testFixtureDir, TestFixtureDirConfig } from '@lwc/test-utils-lwc-internals';
import { serverSideRenderComponent } from '@lwc/ssr-runtime';

interface FixtureModule {
    tagName: string;
    default: any;
    generateMarkup: any;
    props?: { [key: string]: any };
    features?: FeatureFlagName[];
}

vi.setConfig({ testTimeout: 10_000 /* 10 seconds */ });

async function compileFixture({ input, dirname }: { input: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled-experimental-ssr.js');
    // TODO [#3331]: this is only needed to silence warnings on lwc:dynamic, remove in 246.
    const warnings: RollupLog[] = [];

    const bundle = await rollup({
        input,
        external: ['lwc'],
        plugins: [
            lwcRollupPlugin({
                targetSSR: true,
                enableDynamicComponents: true,
                // TODO [#3331]: remove usage of lwc:dynamic in 246
                experimentalDynamicDirective: true,
                modules: [{ dir: modulesDir }],
            }),
        ],
        onwarn(warning) {
            warnings.push(warning);
        },
    });

    await bundle.write({
        file: outputFile,
        format: 'esm',
        exports: 'named',
    });

    return outputFile;
}

function testFixtures(config: TestFixtureDirConfig) {
    testFixtureDir(config, async ({ filename, dirname, config }) => {
        const errorFile = config?.ssrFiles?.error ?? 'error.txt';
        const expectedFile = config?.ssrFiles?.expected ?? 'expected.html';

        let compiledFixturePath;
        try {
            compiledFixturePath = await compileFixture({
                input: filename,
                dirname,
            });
        } catch (err: any) {
            return {
                [errorFile]: `SSR compilation error:\n${err.message}`,
                [expectedFile]: '',
            };
        }

        const module = (await import(compiledFixturePath)) as FixtureModule;

        let result;
        try {
            result = await serverSideRenderComponent(
                module!.tagName,
                module!.generateMarkup,
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
    });
}

describe('fixtures', () => {
    testFixtures({
        root: path.resolve(__dirname, 'fixtures'),
        pattern: '**/index.js',
    });
    if (process.env.TEST_SSR_COMPILER) {
        testFixtures({
            root: path.resolve(__dirname, '../../../engine-server/src/__tests__/fixtures'),
            pattern: '**/index.js',
        });
    }
});
