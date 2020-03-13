/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { LwcConfigError } from '../errors';

import { fixture } from './test-utils';

describe('parameters checks', () => {
    test('throw when importer is not a string', () => {
        expect(() => (resolveModule as any)()).toThrowErrorWithType(
            TypeError,
            'The importee argument must be a string. Received type undefined'
        );
    });

    test('throw when no importee is not a string', () => {
        expect(() => (resolveModule as any)('test')).toThrowErrorWithType(
            TypeError,
            'The importer argument must be a string. Received type undefined'
        );
    });

    test('throw when passing a relative path', () => {
        expect(() => resolveModule('./test', '.')).toThrowErrorWithType(
            TypeError,
            'The importee argument must be a valid LWC module name. Received "./test"'
        );
    });

    test('throw when passing an absolute path', () => {
        expect(() => resolveModule('/test', '.')).toThrowErrorWithType(
            TypeError,
            'The importee argument must be a valid LWC module name. Received "/test"'
        );
    });
});

describe('alias resolution', () => {
    test('resolve the alias module', () => {
        const specifier = 'custom-module';
        const importer = fixture('custom-resolution/custom-override.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('custom-resolution'),
            entry: fixture('custom-resolution/custom/module.js'),
        });
    });

    test("throw an error when the aliased path doesn't exists", () => {
        const specifier = 'aliased';
        const importer = fixture('errors/missing-aliased-file/index.js');

        // XTODO: Investigate error
        expect(() => resolveModule('test', importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-aliased-file'
            )}". Unknown module record "{"alias":"${specifier}","path":"./missing.js"}"`
        );
    });
});

describe('dir resolution', () => {
    test('resolve a module form the dir', () => {
        const specifier = 'ns/jsEntry';
        const importer = fixture('module-entries/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('module-entries'),
            entry: fixture('module-entries/modules/ns/jsEntry/jsEntry.js'),
        });
    });

    test("throw an error when the dir doesn't exists", () => {
        const specifier = 'test';
        const importer = fixture('errors/missing-dir/index.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-dir'
            )}". Invalid dir module record "{"dir":"./missing"}", directory ${fixture(
                'errors/missing-dir/missing'
            )} doesn't exists`
        );
    });

    test('throw an error when there is no entry file', () => {
        const specifier = 'foo/bar';
        const importer = fixture('errors/missing-dir-entry/index.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-dir-entry'
            )}". Unable to find a valid entry point for "${fixture(
                'errors/missing-dir-entry/modules/foo/bar/bar'
            )}"`
        );
    });
});

describe('NPM resolution', () => {
    test('npm module', () => {
        const specifier = 'deps';
        const importer = fixture('from-npm/src/modules/test.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('from-npm/node_modules/deps'),
            entry: fixture('from-npm/node_modules/deps/deps.js'),
        });
    });

    test('scoped npm module', () => {
        const specifier = 'scoped-deps';
        const importer = fixture('from-npm/src/modules/test.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('from-npm/node_modules/@scoped/deps'),
            entry: fixture('from-npm/node_modules/@scoped/deps/scoped-deps.js'),
        });
    });

    test("throw when npm package doesn't exists", () => {
        const specifier = 'deps';
        const importer = fixture('errors/missing-npm-package/index.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-package'
            )}". Invalid npm module record "{"npm":"missing-deps"}", "missing-deps" npm module can't be resolved`
        );
    });

    test('throw when missing lwc config in resolved npm package', () => {
        const specifier = 'deps';
        const importer = fixture('errors/missing-npm-package-lwc-config/index.js');

        // XTODO: This error message should be different in this case here, the referenced package
        // doesn't include any LWC config. Because of this, we should throw an error stating that
        // the referenced package is not compatible with LWC.
        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-package-lwc-config/node_modules/deps'
            )}". Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.`
        );
    });

    test('throw when npm package has no expose property', () => {
        const specifier = 'npm-error';
        const importer = fixture('errors/npm/index.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/npm/node_modules/npm-error'
            )}". Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.`
        );
    });

    test("throw when npm package can't resolve exposed module", () => {
        const specifier = 'exposed';
        const importer = fixture('errors/missing-npm-exposed-module');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-exposed-module/node_modules/deps'
            )}". Unable to find "exposed" under npm package "deps"`
        );
    });
});

describe('resolution override', () => {
    // XTODO: Add test about how the configs are merged and how overrides and existing modules are \
    // resolved.
    test('alias module override', () => {
        const specifier = 'no-config';
        const importer = fixture('no-config/custom-override.js');
        const options = {
            modules: [
                {
                    name: 'no-config',
                    path: fixture('no-config/custom/module.js'),
                },
            ],
        };

        expect(resolveModule(specifier, importer, options)).toEqual({
            specifier,
            scope: fixture('no-config'),
            entry: fixture('no-config/custom/module.js'),
        });
    });

    test('dir module override', () => {
        const specifier = 'foo/bar';
        const importer = fixture('no-config/custom-override.js');
        const options = {
            rootDir: fixture('no-config'),
            modules: [
                {
                    dir: 'modules',
                },
            ],
        };

        expect(resolveModule(specifier, importer, options)).toEqual({
            specifier,
            scope: fixture('no-config'),
            entry: fixture('no-config/modules/foo/bar/bar.css'),
        });
    });

    test('throw when the option module is invalid', () => {
        const importer = fixture('no-config');
        const opts: any = { modules: [{}] };

        expect(() => resolveModule('test', importer, opts)).toThrowErrorWithType(
            LwcConfigError,
            `Invalid LWC configuration in "${importer}". Unknown module record "{}"`
        );
    });
});
