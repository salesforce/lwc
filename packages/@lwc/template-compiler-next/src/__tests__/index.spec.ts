/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import glob from 'glob';

import { compile } from '../index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

const EXPECTED_JS_FILENAME = 'expected.js';
const EXPECTED_AST_FILENAME = 'ast.json';

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
            testFn = (it as any).only;
        } else if (fixtureFileExists(SKIP_FILENAME)) {
            testFn = (it as any).skip;
        }

        testFn(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');

            const config = JSON.parse(readFixtureFile('config.json')) || {};
            let expectedCode = readFixtureFile(EXPECTED_JS_FILENAME);
            let expectedAST = JSON.parse(readFixtureFile(EXPECTED_AST_FILENAME));

            const actual = compile(src, config);

            if (expectedCode === null) {
                // write compiled js file if doesn't exist (ie new fixture)
                expectedCode = actual.code;
                writeFixtureFile(EXPECTED_JS_FILENAME, expectedCode);
            }

            if (expectedAST === null) {
                expectedAST = actual.ast;
                writeFixtureFile(EXPECTED_AST_FILENAME, JSON.stringify(expectedAST, null, 4));
            }

            expect(actual.code).toEqual(expectedCode);
            expect(actual.ast).toEqual(expectedAST);
        });
    }
});
