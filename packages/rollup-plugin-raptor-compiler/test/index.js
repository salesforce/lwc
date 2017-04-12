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
    'simple_app',
];

const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for: ', () => {
    fs.readdirSync(fixturesDir).map((caseName) => {
        if (skipTests.indexOf(caseName) >= 0) return;
        const fixtureCaseDir = path.join(fixturesDir, caseName);

        it(`output match: ${caseName}`, () => {
            const entry = path.join(fixtureCaseDir, caseName + '.js');
            return doRollup(entry).then(res => {
                const { code: actual } = res;

                const expected = fs.readFileSync(path.join(fixtureCaseDir, 'expected.js'));
                assert.equal(trim(actual), trim(expected));
            })
        });
    });
});


describe('emit asserts for simple_app: ', () => {
    const fixtureCaseDir = path.join(fixturesDir, 'simple_app/src');

    it(`output match:`, () => {
        const entry = path.join(fixtureCaseDir, 'main.js');
        return doRollup(entry).then(res => {
            const { code: actual } = res;

            const expected = fs.readFileSync(path.join(fixturesDir, 'simple_app/expected.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });
});

function doRollup(entry, options = {}) {
    return rollup.rollup({
        entry,
        external: ['raptor'],
        plugins: [
            rollupCompile(options)
        ],
    }).then(bundle => (
        bundle.generate({
            format: 'es'
        })
    ));
}
