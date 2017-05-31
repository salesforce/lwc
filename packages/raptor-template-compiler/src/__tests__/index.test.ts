import * as fs from 'fs';
import * as path from 'path';

import * as glob from 'glob';
import * as prettier from 'prettier';

import compiler from '../index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

describe('snapshots ', () => {
    const fixtures = glob.sync(path.resolve(FIXTURE_DIR, '**/*.html'));

    for (const caseEntry of fixtures) {
        const caseFolder = path.dirname(caseEntry);
        const caseName = path.relative(FIXTURE_DIR, caseFolder);

        const readFixtureFile = (fileName) => (
            fs.readFileSync(path.join(caseFolder, fileName), 'utf-8')
        );

        it(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');
            const expectedCode = readFixtureFile('expected.js');
            const expetedMetaData = JSON.parse(readFixtureFile('metadata.json'));

            const actual = compiler(src);

            if (expectedCode && expectedCode.length) {
                expect(
                    prettier.format(actual.code),
                ).toEqual(
                    prettier.format(expectedCode),
                );
            }

            expect(actual.warnings).toEqual(expetedMetaData.warnings || []);

            if (actual.metadata) {
                const actualMeta = actual.metadata;
                const expectMeta = expetedMetaData.metadata || {};

                expect(Array.from(actualMeta.usedIds)).toEqual(expectMeta.usedIds || []);
                expect(Array.from(actualMeta.componentDependency)).toEqual(expectMeta.componentDependency || []);
                expect(Array.from(actualMeta.definedSlots)).toEqual(expectMeta.definedSlots || []);
            }
        });
    }
});
