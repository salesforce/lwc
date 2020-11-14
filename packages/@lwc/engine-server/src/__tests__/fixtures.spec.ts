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

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

const DIST_DIRNAME = 'dist';
const MODULE_DIRNAME = 'modules';
const FIXTURE_NAMESPACE = 'x';

const CONFIG_FILENAME = 'config.json';
const COMPILER_ENTRY_FILENAME = 'fixture.js';
const EXPECTED_HTML_FILENAME = 'expected.html';

const ONLY_FILENAME = '.only';
const SKIP_FILENAME = '.skip';

jest.setTimeout(10_000 /* 10 seconds */);

function formatHTML(code: string): string {
    return prettier.format(code, {
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore',
    });
}

describe('fixtures', () => {
    const fixtures = fs.readdirSync(FIXTURE_DIR);

    for (const caseName of fixtures) {
        const caseTagName = `${FIXTURE_NAMESPACE}-${caseName}`;
        const caseModuleName = `${FIXTURE_NAMESPACE}/${caseName}`;
        const caseFolder = path.join(FIXTURE_DIR, caseName);

        const fixtureFilePath = (fileName): string => {
            return path.join(caseFolder, fileName);
        };

        const fixtureFileExists = (fileName): boolean => {
            const filePath = fixtureFilePath(fileName);
            return fs.existsSync(filePath);
        };

        const readFixtureFile = (fileName): string => {
            const filePath = fixtureFilePath(fileName);
            return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
        };

        const writeFixtureFile = (fileName, content): void => {
            const filePath = fixtureFilePath(fileName);
            fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
        };

        const compileFixture = async () => {
            const bundle = await rollup({
                input: COMPILER_ENTRY_FILENAME,
                plugins: [
                    {
                        name: 'fixture-resolver',
                        resolveId(specifier) {
                            if (specifier === COMPILER_ENTRY_FILENAME) {
                                return COMPILER_ENTRY_FILENAME;
                            }
                        },
                        load(specifier) {
                            if (specifier === COMPILER_ENTRY_FILENAME) {
                                return `export { default as ctor } from '${caseModuleName}';`;
                            }
                        },
                    },
                    {
                        name: 'lwc-server-resolver',
                        resolveId(specifier) {
                            if (specifier === 'lwc') {
                                const lwcServerRelativePath = path.relative(
                                    fixtureFilePath(MODULE_DIRNAME),
                                    path.resolve(__dirname, '../index')
                                );

                                return {
                                    id: lwcServerRelativePath,
                                    external: true,
                                };
                            }
                        },
                    },
                    lwcRollupPlugin({
                        modules: [
                            {
                                dir: fixtureFilePath(MODULE_DIRNAME),
                            },
                        ],
                    }) as any,
                ],
            });

            await bundle.write({
                dir: fixtureFilePath(DIST_DIRNAME),
            });

            return fixtureFilePath(`${DIST_DIRNAME}/${COMPILER_ENTRY_FILENAME}`);
        };

        let testFn = it;
        if (fixtureFileExists(ONLY_FILENAME)) {
            testFn = (it as any).only;
        } else if (fixtureFileExists(SKIP_FILENAME)) {
            testFn = (it as any).skip;
        }

        testFn(`${caseName}`, async () => {
            const compiledFixturePath = await compileFixture();

            let expected = readFixtureFile(EXPECTED_HTML_FILENAME);
            const config = JSON.parse(readFixtureFile(CONFIG_FILENAME) || '{}');

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

            const actual = lwcEngineServer.renderComponent(
                caseTagName,
                module.ctor,
                config.props || {}
            ).html;

            if (!expected) {
                // Write rendered HTML file if doesn't exist (ie new fixture).
                expected = actual;
                writeFixtureFile(EXPECTED_HTML_FILENAME, formatHTML(expected));
            }

            // Check rendered HTML.
            expect(formatHTML(actual)).toEqual(formatHTML(expected));
        });
    }
});
