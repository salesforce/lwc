/* eslint-env node, mocha */
const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const rollup = require('rollup');
const rollupCompile = require('../src/index');

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const skipTests = [
    '.babelrc',
    '.DS_Store',
    'bundle',
    'simpleApp',
];

const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;

        it(`output match: ${caseName}`, () => {
            const fixtureCaseDir = path.join(fixturesDir, caseName);
            return doRollup(path.join(fixtureCaseDir, caseName + '.js'))
            .then((bundle) => {
                const actual = bundle.generate({}).code;
                //console.log(actual);
                const expected = fs.readFileSync(path.join(fixtureCaseDir, 'expected.js'));
                assert.equal(trim(actual), trim(expected));
            })
        });
    });
});

function doRollup(filePath, options) {
    return rollup.rollup({
        entry: filePath,
        plugins: [
            rollupCompile(options)
        ]
    });
}
