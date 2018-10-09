const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const prettier = require('prettier');
const rollupCompile = require('../index');
const rollupCompat = require('rollup-plugin-compat');

function pretty(str) {
    return prettier.format(str);
}

function fsExpected(fileName) {
    return fs.readFileSync(path.join(fixturesDir, `${fileName}.js`), 'utf-8');
}

const fixturesDir = path.join(__dirname, 'fixtures');
const simpleAppDir = path.join(fixturesDir, 'simple_app/src');

describe('default configuration', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat : false }).then(({ code: actual }) => {
            const expected = fsExpected('expected_default_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        });
    });
});

describe('rollup in compat mode', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat : true }).then(({ code: actual }) => {
            const expected = fsExpected('expected_compat_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        });
    });
});

const globalModules = { lwc: 'Engine' };

function doRollup(input, { compat } = {}) {
    return rollup.rollup({
        input,
        external: (id) => (id in globalModules),
        plugins: [
            rollupCompile(),
            compat && rollupCompat({ polyfills: false })
        ].filter(Boolean),
        onwarn(warn) {
            if (warn && warn.code !== 'UNRESOLVED_IMPORT') {
                console.warn(warn.message);
            }
        }
    }).then(bundle => (
        bundle.generate({
            format: 'iife',
            name: 'test',
            output: { globals: globalModules }
        })
    ));
}
