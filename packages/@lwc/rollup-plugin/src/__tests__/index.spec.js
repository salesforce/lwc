/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const fs = require('fs');
const rollup = require('rollup');
const rollupCompat = require('rollup-plugin-compat');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const rollupCompile = require('../index');
require('jest-utils-lwc-internals');

const fixturesDir = path.join(__dirname, 'fixtures');
const simpleAppDir = path.join(fixturesDir, 'simple_app/src');
const simpleAppWithThirdPartyDir = path.join(fixturesDir, 'simple_app_third_party_import/src');
const simpleAppDirWithScopedStyles = path.join(fixturesDir, 'simple_app_with_scoped_styles/src');
const tsAppDir = path.join(fixturesDir, 'ts_simple_app/src');
const jsMultiVersion = path.join(fixturesDir, 'multi_version');

describe('default configuration', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_simple_app.js')
            );
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
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_simple_app_css_resolver.js')
            );
        });
    });

    it(`simple app compiled with preserveHtmlComments option`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        const rollupCompileOptions = {
            preserveHtmlComments: true,
        };
        return doRollup(entry, { compat: false }, rollupCompileOptions).then(({ code: actual }) => {
            expect(actual).toContain('Application container');
        });
    });

    it('simple app with @rollup/plugin-node-resolve and third-party package', () => {
        const entry = path.join(simpleAppWithThirdPartyDir, 'main.js');
        return doRollup(entry, { compat: false, resolve: true }).then(({ code: actual }) => {
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_simple_app_third_party.js')
            );
        });
    });

    it('simple app with another plugin that resolves scoped styles', () => {
        const entry = path.join(simpleAppDirWithScopedStyles, 'main.js');
        const extraPlugins = [
            {
                name: 'resolve-scoped-styles',
                resolveId(importee, importer) {
                    if (importee.endsWith('?scoped=true')) {
                        const importeeWithoutQuery = importee.replace('?scoped=true', '');
                        const importerDir = path.dirname(importer);
                        const fullImportee = path.resolve(importerDir, importee);
                        const fullImporteeWithoutQuery = path.resolve(
                            importerDir,
                            importeeWithoutQuery
                        );
                        if (fs.existsSync(fullImporteeWithoutQuery)) {
                            // mimics @rollup/plugin-node-resolve, which can resolve the ID with the query param
                            return fullImportee;
                        }
                    }
                },
            },
        ];
        return doRollup(entry, { extraPlugins }).then(({ code: actual }) => {
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_simple_app_with_scoped_styles.js')
            );
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
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_simple_app_relative.js')
            );
        });
    });
});

describe('rollup in compat mode', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: true }).then(({ code: actual }) => {
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_compat_config_simple_app.js')
            );
        });
    });
});

describe('typescript relative import', () => {
    it(`should resolve to .ts file`, () => {
        const entry = path.join(tsAppDir, 'main.ts');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            expect(actual).toMatchFile(
                path.join(fixturesDir, 'expected_default_config_ts_simple_app.js')
            );
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

async function doRollup(input, { compat, resolve, extraPlugins } = {}, rollupCompileOptions) {
    const bundle = await rollup.rollup({
        input,
        external: (id) => id in globalModules,
        plugins: [
            ...(extraPlugins || []),
            resolve && nodeResolve(),
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
