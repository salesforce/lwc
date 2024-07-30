/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';

import { vi } from 'vitest';
import { rollup, RollupLog } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { FeatureFlagName } from '@lwc/features/dist/types';
import { testFixtureDir, formatHTML } from '@lwc/test-utils-lwc-internals';
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
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
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

function testFixtures() {
    testFixtureDir(
        {
            root: path.resolve(__dirname, '../../../engine-server/src/__tests__/fixtures'),
            pattern: '**/index.js',
        },
        async ({ filename, dirname }) => {
            const configPath = path.resolve(dirname, 'config.json');

            let config: any = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            const compiledFixturePath = await compileFixture({
                input: filename,
                dirname,
            });

            const module = (await import(compiledFixturePath)) as FixtureModule;

            try {
                const result = await serverSideRenderComponent(
                    module!.tagName,
                    module!.generateMarkup,
                    config.props || {}
                );
                return {
                    'expected.html': formatHTML(result),
                    'error.txt': '',
                };
            } catch (err: any) {
                return {
                    'error.txt': err.message,
                    'expected.html': '',
                };
            }
        }
    );
}

describe('fixtures', () => {
    testFixtures();
});
