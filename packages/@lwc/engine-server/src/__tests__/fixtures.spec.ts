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
import lwcRollupPlugin from '@lwc/rollup-plugin';
import { testFixtureDir } from '@lwc/internal-jest-utils';

jest.setTimeout(10_000 /* 10 seconds */);

async function compileFixture({ input, dirname }) {
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
            }) as any,
        ],
    });

    await bundle.write({
        file: outputFile,
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
            let lwcEngineServer;
            let module;
            jest.isolateModules(() => {
                lwcEngineServer = require('../index');
                module = require(compiledFixturePath);
            });

            const result = lwcEngineServer.renderComponent(
                module.tagName,
                module.default,
                config.props || {}
            );

            return {
                'expected.html': formatHTML(result),
            };
        }
    );
});
