const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const rollup = require('rollup');
const prettier = require('prettier');
const rollupCompile = require('../src/index');

function pretty(str) {
    return prettier.format(str);
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

                const expected = fs.readFileSync(path.join(fixtureCaseDir, 'expected.js'), 'utf-8');
                assert.equal(pretty(actual), pretty(expected));
            })
        });
    });
});


describe('emit asserts for simple_app: ', () => {
    const fixtureCaseDir = path.join(fixturesDir, 'simple_app/src');

    it(`output match:`, () => {
        const entry = path.join(fixtureCaseDir, 'main.js');
        return doRollup(entry, { allowUnnamespaced: true } ).then(res => {
            const { code: actual } = res;

            const expected = fs.readFileSync(path.join(fixturesDir, 'simple_app/expected.js'), 'utf-8');
            assert.equal(pretty(actual), pretty(expected));
        })
    });
});

function doRollup(entry, options = {}) {
    return rollup.rollup({
        entry,
        external: ['engine'],
        plugins: [
            rollupCompile(options)
        ],
        onwarn(warn) {
            if (warn && warn.code !== 'UNRESOLVED_IMPORT') {
                console.warn(warn.message);
            }
        }
    }).then(bundle => (
        bundle.generate({
            format: 'es'
        })
    ));
}
