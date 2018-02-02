import * as fs from 'fs';
import * as path from 'path';

import * as glob from 'glob';
import * as prettier from 'prettier';

import compiler from '../index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const BASE_CONFIG = {};

describe('fixtures', () => {
    const fixtures = glob.sync(path.resolve(FIXTURE_DIR, 'directive-key/**/*.html'));

    for (const caseEntry of fixtures) {
        const caseFolder = path.dirname(caseEntry);
        const caseName = path.relative(FIXTURE_DIR, caseFolder);

        const readFixtureFile = (fileName, defaultContent = '') => {
            const filePath = path.join(caseFolder, fileName);
            return fs.existsSync(filePath) ?
                fs.readFileSync(filePath, 'utf-8') :
                defaultContent;
        };

        it(`${caseName}`, () => {
            const src = readFixtureFile('actual.html');

            const configOverride = JSON.parse(readFixtureFile('config.json', '{}'));
            const expectedCode = readFixtureFile('expected.js', '');
            const expetedMetaData = JSON.parse(readFixtureFile('metadata.json', '{}'));

            const actual = compiler(src, {
                ...BASE_CONFIG,
                ...configOverride,
            });

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

                expect(Array.from(actualMeta.templateUsedIds)).toEqual(expectMeta.templateUsedIds || []);
                expect(Array.from(actualMeta.templateDependencies)).toEqual(expectMeta.templateDependencies || []);
                expect(Array.from(actualMeta.definedSlots)).toEqual(expectMeta.definedSlots || []);
            }
        });
    }
});
