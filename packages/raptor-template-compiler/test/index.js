import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import {compile} from '../src/index';

const fixturesDir = path.join(__dirname, 'fixtures');
const skipTests = [];

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;

        it(`output match: ${caseName}`, () => {
            const fixtureDir = path.join(fixturesDir, caseName);
            const fixtureSrc = fs.readFileSync(path.join(fixtureDir, 'actual.html')).toString();

            const actual = compile(fixtureSrc).code;

            const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js')).toString();
            assert.equal(trim(actual), trim(expected));
        });
    });
});