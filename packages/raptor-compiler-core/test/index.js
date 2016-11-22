import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import {compile} from '../src/index';

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const skipTests = [
    '.babelrc',
    '.DS_Store'
];

const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;

        it(`output match: ${caseName}`, () => {
            const fixtureCaseDir = path.join(fixturesDir, caseName);
            return runCompile(path.join(fixtureCaseDir, caseName + '.js'))
            .then((result) => {
                const actual = result.code;
                const expected = fs.readFileSync(path.join(fixtureCaseDir, 'expected.js'));
                
                assert.equal(trim(actual), trim(expected));
            })
            .catch((error) => {
                assert.fail(error);
            });
        });
    });
});
const BASE_CONFIG = {};

function runCompile(filePath, options = {}) {
    const config = Object.assign({}, BASE_CONFIG, options);
    return compile({ entry: filePath }, config);
}

