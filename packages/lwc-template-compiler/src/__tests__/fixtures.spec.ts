import * as fs from 'fs';
import * as path from 'path';

import * as glob from 'glob';
import * as prettier from 'prettier';

import compiler from '../index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const BASE_CONFIG = {};

describe('fixtures', () => {
    const fixtures = glob.sync(path.resolve(FIXTURE_DIR, '**/*.html'));

    for (const caseEntry of fixtures) {
        const caseFolder = path.dirname(caseEntry);
        const caseName = path.relative(FIXTURE_DIR, caseFolder);

        const fixtureFilePath = (fileName): string => {
            return path.join(caseFolder, fileName);
        };

        const readFixtureFile = (fileName): string => {
            const filePath = fixtureFilePath(fileName);
            return fs.existsSync(filePath) ?
                fs.readFileSync(filePath, 'utf-8') :
                null;
        };

        const writeFixtureFile = (fileName, content): void => {
            const filePath = fixtureFilePath(fileName);
            fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
        };

        const expectedJsFile = 'expected.js';
        const expectedMetaFile = 'metadata.json';

        it(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');

            const configOverride = JSON.parse(readFixtureFile('config.json'));
            let expectedCode = readFixtureFile(expectedJsFile);
            let expectedMetaData = JSON.parse(readFixtureFile(expectedMetaFile));

            const actual = compiler(src, {
                ...BASE_CONFIG,
                ...configOverride,
            });

            const actualMeta = actual.metadata;

            if (expectedCode === null) {
                // write compiled js file if doesn't exist (ie new fixture)
                expectedCode = actual.code;
                writeFixtureFile(expectedJsFile, prettier.format(expectedCode));

            }

            if (expectedMetaData === null) {
                // write metadata file if doesn't exist (ie new fixture)
                const metadata = {
                    warnings: actual.warnings,
                    metadata: {...actualMeta},
                };
                expectedMetaData = metadata;
                writeFixtureFile(expectedMetaFile, JSON.stringify(expectedMetaData, null, 4));
            }

            // check warnings
            expect(actual.warnings).toEqual(expectedMetaData.warnings || []);
            // check compiled code
            expect(
                prettier.format(actual.code),
            ).toEqual(
                prettier.format(expectedCode),
            );

            if (actualMeta) {
                const expectMeta = expectedMetaData.metadata || {};

                expect(Array.from(actualMeta.templateUsedIds)).toEqual(expectMeta.templateUsedIds || []);
                expect(Array.from(actualMeta.templateDependencies)).toEqual(expectMeta.templateDependencies || []);
                expect(Array.from(actualMeta.definedSlots)).toEqual(expectMeta.definedSlots || []);
            }
        });
    }
});
