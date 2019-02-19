/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as fs from 'fs';
import * as path from 'path';

import * as glob from 'glob';
import * as prettier from 'prettier';

import compiler from '../index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const BASE_CONFIG = {};

const EXPECTED_JS_FILENAME = 'expected.js';
const EXPECTED_META_FILENAME = 'metadata.json';

const ONLY_FILENAME = '.only';
const SKIP_FILENAME = '.skip';

describe('fixtures', () => {
    const fixtures = glob.sync(path.resolve(FIXTURE_DIR, '**/*.html'));

    for (const caseEntry of fixtures) {
        const caseFolder = path.dirname(caseEntry);
        const caseName = path.relative(FIXTURE_DIR, caseFolder);

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

        let testFn = it;
        if (fixtureFileExists(ONLY_FILENAME)) {
            testFn = it.only;
        } else if (fixtureFileExists(SKIP_FILENAME)) {
            testFn = it.skip;
        }

        testFn(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');

            const configOverride = JSON.parse(readFixtureFile('config.json'));
            let expectedCode = readFixtureFile(EXPECTED_JS_FILENAME);
            let expectedMetaData = JSON.parse(readFixtureFile(EXPECTED_META_FILENAME));

            const actual = compiler(src, {
                ...BASE_CONFIG,
                ...configOverride,
            });

            const actualMeta = actual.metadata;

            if (expectedCode === null) {
                // write compiled js file if doesn't exist (ie new fixture)
                expectedCode = actual.code;
                writeFixtureFile(
                    EXPECTED_JS_FILENAME,
                    prettier.format(expectedCode, {
                        parser: 'babel',
                    }),
                );
            }

            if (expectedMetaData === null) {
                // write metadata file if doesn't exist (ie new fixture)
                const metadata = {
                    warnings: actual.warnings,
                    metadata: { ...actualMeta },
                };
                expectedMetaData = metadata;
                writeFixtureFile(EXPECTED_META_FILENAME, JSON.stringify(expectedMetaData, null, 4));
            }

            // check warnings
            expect(actual.warnings).toEqual(expectedMetaData.warnings || []);
            // check compiled code
            expect(prettier.format(actual.code, { parser: 'babel' })).toEqual(
                prettier.format(expectedCode, { parser: 'babel' }),
            );

            if (actualMeta) {
                const expectMeta = expectedMetaData.metadata || {};

                expect(Array.from(actualMeta.templateUsedIds)).toEqual(
                    expectMeta.templateUsedIds || [],
                );
                expect(Array.from(actualMeta.templateDependencies)).toEqual(
                    expectMeta.templateDependencies || [],
                );
                expect(Array.from(actualMeta.definedSlots)).toEqual(expectMeta.definedSlots || []);
            }
        });
    }
});
