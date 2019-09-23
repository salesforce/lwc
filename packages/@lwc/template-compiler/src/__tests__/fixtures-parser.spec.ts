/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import glob from 'glob';

import { parse } from '../index';

const FIXTURES_DIR = path.join(__dirname, 'fixtures-parser');

const EXPECTED_JSON_FILENAME = 'expected.json';
const EXPECTED_META_FILENAME = 'metadata.json';

const ONLY_FILENAME = '.only';
const SKIP_FILENAME = '.skip';

describe('fixtures-parser', () => {
    const fixtures = glob.sync(path.resolve(FIXTURES_DIR, '**/*.html'));

    for (const caseEntry of fixtures) {
        const caseFolder = path.dirname(caseEntry);
        const caseName = path.relative(FIXTURES_DIR, caseFolder);

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
            testFn = (it as any).only;
        } else if (fixtureFileExists(SKIP_FILENAME)) {
            testFn = (it as any).skip;
        }

        testFn(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');
            const configOverride = JSON.parse(readFixtureFile('config.json'));
            const actual = parse(src, configOverride);

            let expectedAST = JSON.parse(readFixtureFile(EXPECTED_JSON_FILENAME));
            if (expectedAST === null) {
                // write file if doesn't exist (ie new fixture)
                expectedAST = actual.root;
                writeFixtureFile(EXPECTED_JSON_FILENAME, JSON.stringify(expectedAST, null, 4));
            }
            // check serialized ast
            expect(JSON.stringify(actual.root, null, 4)).toEqual(
                JSON.stringify(expectedAST, null, 4)
            );

            let expectedMetaData = JSON.parse(readFixtureFile(EXPECTED_META_FILENAME));
            if (expectedMetaData === null) {
                // write metadata file if doesn't exist (ie new fixture)
                const metadata = {
                    warnings: actual.warnings,
                };
                expectedMetaData = metadata;
                writeFixtureFile(EXPECTED_META_FILENAME, JSON.stringify(expectedMetaData, null, 4));
            }
            // check warnings
            expect(actual.warnings).toEqual(expectedMetaData.warnings || []);
        });
    }
});
