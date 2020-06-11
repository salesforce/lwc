/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { rollup } from 'rollup';
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
    const { renderComponent } = require('../');

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
                external: ['lwc'],
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
        };

        let testFn = it;
        if (fixtureFileExists(ONLY_FILENAME)) {
            testFn = (it as any).only;
        } else if (fixtureFileExists(SKIP_FILENAME)) {
            testFn = (it as any).skip;
        }

        testFn(`${caseName}`, async () => {
            await compileFixture();

            let expected = readFixtureFile(EXPECTED_HTML_FILENAME);
            const config = JSON.parse(readFixtureFile(CONFIG_FILENAME) || '{}');

            const module = require(fixtureFilePath(`${DIST_DIRNAME}/${COMPILER_ENTRY_FILENAME}`));
            const actual = renderComponent(caseTagName, module.ctor, config.props || {});

            if (!expected) {
                // write rendered HTML file if doesn't exist (ie new fixture)
                expected = actual;
                writeFixtureFile(EXPECTED_HTML_FILENAME, formatHTML(expected));
            }

            // check rendered HTML
            expect(formatHTML(actual)).toEqual(formatHTML(expected));
        });
    }
});
