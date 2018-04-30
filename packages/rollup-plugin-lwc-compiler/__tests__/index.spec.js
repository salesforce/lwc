const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const prettier = require('prettier');
const rollupCompile = require('../src/index');

function pretty(str) {
    return prettier.format(str);
}

function fsExpected(fileName) {
    return fs.readFileSync(path.join(fixturesDir, `${fileName}.js`), 'utf-8');
}

const fixturesDir = path.join(__dirname, 'fixtures');
const simpleAppDir = path.join(fixturesDir, 'simple_app/src');

jest.mock('compat-polyfills', () => {
    return {
        loadPolyfills() { return "/* MOCK POLYFILLS SRC */" },
        loadDowngrade() {  return "/* MOCK DOWNGRADE SRC */" }
    };
});

describe('default configuration', () => {
    const rollupOptions = { allowUnnamespaced: true };

    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, rollupOptions).then(({ code: actual }) => {
            const expected = fsExpected('expected_default_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        })
    });
});

describe('rollup in compat mode', () => {
    const rollupOptions = { allowUnnamespaced: true, mode: 'compat' };

    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, rollupOptions).then(({ code: actual }) => {
            const expected = fsExpected('expected_compat_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        })
    });
});

describe('rollup in prod_compat mode', () => {
    const rollupOptions = { allowUnnamespaced: true, mode: 'prod_compat' };
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, rollupOptions).then(({ code: actual }) => {
            const expected = fsExpected('expected_prod_compat_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        })
    });
});

function doRollup(input, options = {}) {
    return rollup.rollup({
        input,
        external: [ 'engine' ],
        plugins: [ rollupCompile(options) ],
        onwarn(warn) {
            if (warn && warn.code !== 'UNRESOLVED_IMPORT') {
                console.warn(warn.message);
            }
        }
    }).then(bundle => (
        bundle.generate({
            format: 'iife',
            name: 'test',
            output: { globals: { engine: 'engine' } }
        })
    ));
}
