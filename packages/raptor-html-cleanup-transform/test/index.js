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
            const src = fs.readFileSync(path.join(fixtureDir, 'actual.html'), 'utf-8');

            try {
                const actual = transform(src);
                var expected = fs.readFileSync(path.join(fixtureDir, 'expected.html'), 'utf-8');

                assert.equal(trim(actual), trim(expected));
            } catch(error) {
                try {
                    expected = JSON.parse(
                        fs.readFileSync(path.join(fixtureDir, 'error.json'), 'utf-8')
                    );
                } catch (err) {
                    if (err.message.includes('ENOENT')) {
                        throw error;
                    }
                }

                assert.equal(error.message, expected.message, 'Messages are not matching');
                assert.equal(error.loc.line, expected.line, 'Error lines are not matching');
                assert.equal(error.loc.column, expected.column, 'Error columns are not matching');
            }
        });
    });
});

function transform(src) {
    return plugin.transform(src);
}
