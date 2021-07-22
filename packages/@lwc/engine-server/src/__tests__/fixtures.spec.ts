/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';

import { rollup } from 'rollup';
import prettier from 'prettier';
// @ts-ignore
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir } from 'jest-utils-lwc-internals';
import type * as lwc from '../index';

interface FixtureModule {
    tagName: string;
    default: typeof lwc.LightningElement;
    props?: { [key: string]: any };
    features?: string[];
}

jest.setTimeout(10_000 /* 10 seconds */);

async function compileFixture({ input, dirname }: { input: string; dirname: string }) {
    const modulesDir = path.resolve(dirname, './modules');
    const outputFile = path.resolve(dirname, './dist/compiled.js');

    const bundle = await rollup({
        input,
        external: ['lwc'],
        plugins: [
            lwcRollupPlugin({
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
            }),
        ],
    });

    await bundle.write({
        file: outputFile,
        format: 'cjs',
        exports: 'named',
    });

    return outputFile;
}

function formatHTML(code: string): string {
    return prettier.format(code, {
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore',
    });
}

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
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

            // The LWC engine holds global state like the current VM index, which has an impact on
            // the generated HTML IDs. So the engine has to be re-evaluated between tests.
            // On top of this, the engine also checks if the component constructor is an instance of
            // the LightningElement. Therefor the compiled module should also be evaluated in the
            // same sandbox registry as the engine.
            let lwcEngineServer: typeof lwc | undefined;
            let module: FixtureModule | undefined;
            jest.isolateModules(() => {
                lwcEngineServer = require('../index');
                module = require(compiledFixturePath);
            });

            const features: string[] = module!.features || [];
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, true);
            });
            const result = lwcEngineServer!.renderComponent(
                module!.tagName,
                module!.default,
                config.props || {}
            );
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': formatHTML(result),
            };
        }
    );
});
