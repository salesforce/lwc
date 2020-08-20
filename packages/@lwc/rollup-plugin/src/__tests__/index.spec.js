/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import prettier from 'prettier';

import rollupPluginCompat from 'rollup-plugin-compat';
import rollupPluginLwc from '../index';

function pretty(str) {
    return prettier.format(str, {
        parser: 'babel',
    });
}

function fsExpected(fileName) {
    return fs.readFileSync(path.join(fixturesDir, `${fileName}.js`), 'utf-8');
}

const fixturesDir = path.join(__dirname, 'fixtures');
const simpleAppDir = path.join(fixturesDir, 'simple_app/src');
const tsAppDir = path.join(fixturesDir, 'ts_simple_app/src');
const jsMultiVersion = path.join(fixturesDir, 'multi_version');

describe('default configuration', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            const expected = fsExpected('expected_default_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
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
            const expected = fsExpected('expected_default_config_simple_app_css_resolver');
            expect(pretty(actual)).toBe(pretty(expected));
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
            const expected = fsExpected('expected_default_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        });
    });
});

describe('rollup in compat mode', () => {
    it(`simple app`, () => {
        const entry = path.join(simpleAppDir, 'main.js');
        return doRollup(entry, { compat: true }).then(({ code: actual }) => {
            const expected = fsExpected('expected_compat_config_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
        });
    });
});

describe('typescript relative import', () => {
    it(`should resolve to .ts file`, () => {
        const entry = path.join(tsAppDir, 'main.ts');
        return doRollup(entry, { compat: false }).then(({ code: actual }) => {
            const expected = fsExpected('expected_default_config_ts_simple_app');
            expect(pretty(actual)).toBe(pretty(expected));
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

describe('rootDir', () => {
    it('warns if an "input" array is passed and when "rootDir" is not set', async () => {
        const warnings = [];

        await rollup({
            input: [path.join(tsAppDir, 'main.ts'), path.join(jsMultiVersion, 'src/main.js')],
            plugins: [rollupPluginLwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            message: expect.stringMatching(
                /^The "rootDir" option should be explicitly set when passing an "input" array to rollup\. The "rootDir" option is implicitly resolved to .*\/fixtures\/ts_simple_app\/src.$/
            ),
            code: 'PLUGIN_WARNING',
            plugin: 'lwc',
        });
    });

    it('warns if an "input" object is passed and when "rootDir" is not set', async () => {
        const warnings = [];

        await rollup({
            input: {
                entryA: path.join(tsAppDir, 'main.ts'),
                entryB: path.join(jsMultiVersion, 'src/main.js'),
            },
            plugins: [rollupPluginLwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            message: expect.stringMatching(
                /^The "rootDir" option should be explicitly set when passing "input" object to rollup\. The "rootDir" option is implicitly resolved to .*\/fixtures\/ts_simple_app\/src.$/
            ),
            code: 'PLUGIN_WARNING',
            plugin: 'lwc',
        });
    });
});

describe('environment', () => {
    it('throws when setting an environment that is not "dom" or "server"', () => {
        expect(() => rollupPluginLwc({ environment: 'native' })).toThrowError(
            'Invalid "environment" option. Received native but expected "dom", "server" or undefined.'
        );
    });

    it('resolves to "@lwc/engine-dom" by default', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(fixturesDir, 'lwc-only/index.js'),
            plugins: [rollupPluginLwc()],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine\/esm\/es\d+\/engine.js$/);
    });

    it('resolves to "@lwc/engine-dom" when environment is set to "dom"', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(fixturesDir, 'lwc-only/index.js'),
            plugins: [
                rollupPluginLwc({
                    environment: 'dom',
                }),
            ],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine\/esm\/es\d+\/engine.js$/);
    });

    it('resolves to "@lwc/engine-server" when environment is set to "server"', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(fixturesDir, 'lwc-only/index.js'),
            plugins: [
                rollupPluginLwc({
                    environment: 'server',
                }),
            ],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine-server\/esm\/es\d+\/engine-server.js$/);
    });
});

describe('module resolver', () => {
    it('should resolve all the LWC base modules by default', async () => {
        const warnings = [];

        await rollup({
            input: path.resolve(fixturesDir, 'lwc-base-modules/index.js'),
            plugins: [rollupPluginLwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(0);
    });
});

const globalModules = { lwc: 'LWC', myCssResolver: 'resolveCss' };

async function doRollup(input, { compat } = {}, rollupCompileOptions) {
    const bundle = await rollup({
        input,
        external: (id) => id in globalModules,
        plugins: [
            rollupPluginLwc(rollupCompileOptions),

            compat && rollupPluginCompat({ polyfills: false }),
        ],
    });

    const { output } = await bundle.generate({
        format: 'iife',
        name: 'test',
        globals: globalModules,
    });

    return output[0];
}
