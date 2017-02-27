/* eslint-env node, mocha */

const assert = require('power-assert');
const path = require('path');
const fs = require('fs');
const plugin = require('../src/index');

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const skipTests = [
    '.babelrc',
    '.DS_Store',
];

const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;

        it(`output match: ${caseName}`, () => {
            const fixtureDir = path.join(fixturesDir, caseName);
            const src = fs.readFileSync(path.join(fixtureDir, 'actual.html'));
            const expected = fs.readFileSync(path.join(fixtureDir, 'expected.html'));

            return transform(src).then((actual) => {
                assert.equal(trim(actual), trim(expected));
            });

        });
    });
});

function transform(src) {
    return plugin.transform(src);
}
