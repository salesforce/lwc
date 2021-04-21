/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const prettier = require('prettier');
const rollupCompat = require('rollup-plugin-compat');
const rollupCompile = require('../index');

function pretty(str) {
    return prettier.format(str, {
        parser: 'babel',
    });
}

function fsExpected(fileName, actual) {
    const fullFileName = path.join(fixturesDir, `${fileName}.js`);
    if (!fs.existsSync(fullFileName)) {
        fs.writeFileSync(fullFileName, actual, 'utf8');
    }
    const expected = fs.readFileSync(fullFileName, 'utf8');
    expect(actual).toBe(expected);
}

const fixturesDir = path.join(__dirname, 'fixtures');
const simpleAppDir = path.join(fixturesDir, 'simple_app/src');
const tsAppDir = path.join(fixturesDir, 'ts_simple_app/src');
const tsImportsJsDir = path.join(fixturesDir, 'ts_imports_js/src');
const jsImportsTsDir = path.join(fixturesDir, 'js_imports_ts/src');
const jsMultiVersion = path.join(fixturesDir, 'multi_version');

describe('default configuration', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            fsExpected('expected_default_config_simple_app', pretty(actual));
        });
    });

    it(`simple app with CSS resolver`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        const rollupCompileOptions = {
            stylesheetConfig: {
                customProperties: {
                    resolution: {
                        type: 'module',
                        name: 'myCssResolver',
                    },
                },
            },
        };
        return doRollup(entry, { compat: false }, rollupCompileOptions).then(({ code: actual }) => {
            fsExpected('expected_default_config_simple_app_css_resolver', pretty(actual));
        });
    });
});

describe('rollup with custom options', () => {
    it(`should normalize rootDir when present and is a relative path`, () => {
        const entry = path.join(simpleAppDir, 'main.js');

        const rollupOptions = {
            rootDir: path.relative(process.cwd(), path.dirname(entry)),
        };

        return doRollup(entry, { compat: false }, rollupOptions).then(({ code: actual }) => {
            fsExpected('expected_default_config_simple_app', pretty(actual));
        });
    });
});

describe('rollup in compat mode', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: true }).then(({ code: actual }) => {
            fsExpected('expected_compat_config_simple_app', pretty(actual));
        });
    });
});

describe('typescript relative import', () => {
    it(`should resolve to .ts file`, () => {
        const entry = path.join(tsAppDir, 'main.ts');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            fsExpected('expected_default_config_ts_simple_app', pretty(actual));
        });
    });
});

describe('typescript relative import', () => {
    it(`should throw when .ts imports .js file`, () => {
        const entry = path.join(tsImportsJsDir, 'main.ts');
        expect.assertions(1);
        return doRollup(entry, { compat: false }).catch((error) => {
            expect(error).toEqual(new Error('Importing a .js file into a .ts is not supported'));
        });
    });
});

describe('javascript relative import', () => {
    it(`should throw when .js imports .ts file`, () => {
        const entry = path.join(jsImportsTsDir, 'main.js');
        expect.assertions(1);
        return doRollup(entry, { compat: false }).catch((error) => {
            expect(error).toEqual(new Error('Importing a .ts file into a .js is not supported'));
        });
    });
});

describe('multi-package-version', () => {
    it(`should find all modules`, () => {
        const entry = path.join(jsMultiVersion, 'src/main.js');

        return doRollup(entry, { compat: false }, {}).then(({ code }) => {
            expect(code).toContain('"button:v1');
            expect(code).toContain('"button:v2');
        });
    });
});

const globalModules = { lwc: 'LWC', myCssResolver: 'resolveCss' };

async function doRollup(input, { compat } = {}, rollupCompileOptions) {
    const bundle = await rollup.rollup({
        input,
        external: (id) => id in globalModules,
        plugins: [
            rollupCompile(rollupCompileOptions),
            compat && rollupCompat({ polyfills: false }),
        ],
        onwarn(warn) {
            if (warn && warn.code !== 'UNRESOLVED_IMPORT') {
                /* eslint-disable-next-line no-console */
                console.warn(warn.message);
            }
        },
    });

    const { output } = await bundle.generate({
        format: 'iife',
        name: 'test',
        globals: globalModules,
    });

    return output[0];
}
