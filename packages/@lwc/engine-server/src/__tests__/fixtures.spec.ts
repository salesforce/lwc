/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';

import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir, formatHTML } from '@lwc/jest-utils-lwc-internals';
import type * as lwc from '../index';

interface FixtureModule {
    tagName: string;
    default: typeof lwc.LightningElement;
    props?: { [key: string]: any };
    features?: any[];
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
                enableDynamicComponents: true,
                modules: [
                    {
                        dir: modulesDir,
                    },
                ],
            }),
        ],
        onwarn({ message, code }) {
            // TODO [#3331]: The existing lwc:dynamic fixture test will generate warnings that can be safely suppressed.
            if (!message.includes('LWC1187') && code !== 'CIRCULAR_DEPENDENCY') {
                throw new Error(message);
            }
        },
    });

    await bundle.write({
        file: outputFile,
        format: 'cjs',
        exports: 'named',
    });

    return outputFile;
}

function testFixtures() {
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

            const features = module!.features ?? [];
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, true);
            });

            lwcEngineServer!.setHooks({
                sanitizeHtmlContent(content: unknown) {
                    return content as string;
                },
            });

            let result;
            let err;
            try {
                result = lwcEngineServer!.renderComponent(
                    module!.tagName,
                    module!.default,
                    config.props || {}
                );
            } catch (_err: any) {
                err = _err.message;
            }
            features.forEach((flag) => {
                lwcEngineServer!.setFeatureFlagForTest(flag, false);
            });

            return {
                'expected.html': result ? formatHTML(result) : undefined,
                'error.txt': err,
            };
        }
    );
}

describe('fixtures', () => {
    testFixtures();
});
