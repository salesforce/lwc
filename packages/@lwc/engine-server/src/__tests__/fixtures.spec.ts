import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { transformSync } from '@lwc/compiler';

const COMPILED_DIR_NAME = 'dist';
const FIXTURE_DIR = path.join(__dirname, 'fixtures');

const EXPECTED_HTML_FILENAME = 'expected.html';

const ONLY_FILENAME = '.only';
const SKIP_FILENAME = '.skip';

describe('fixtures', () => {
    const fixtures = fs.readdirSync(FIXTURE_DIR);

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

        const getFixtureFiles = (): string[] => {
            return fs.readdirSync(caseFolder)
                .filter(name => name !== ONLY_FILENAME && name !== SKIP_FILENAME && name !== EXPECTED_HTML_FILENAME)
        }

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
            const filesToCompile = getFixtureFiles();
            
            for (const fileToCompile of filesToCompile) {
                const src = readFixtureFile(fileToCompile);
                const res = transformSync(src, fileToCompile, {});
                writeFixtureFile(`${COMPILED_DIR_NAME}/${fileToCompile}`, res.code);
            }
        });
    }
});
