/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
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

    test('throw when incorrect moduleRecord type', () => {
        const opts = { modules: [{ unknownType: 'test ' }] };
        expect(() => (resolveModule as any)('test', '', opts)).toThrowErrorWithType(
            Error,
            'Invalid moduleRecord type {"unknownType":"test "}'
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

        // XTODO: add more details here.
        expect(() => resolveModule(specifier, importer)).toThrow(
            `Invalid moduleRecord type {"alias":"${specifier}","path":"./missing.js"}`
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

    // XTODO: Enable this test
    test.skip("throw an error when the dir doesn't exists", () => {
        const specifier = 'test';
        const importer = fixture('errors/missing-dir/index.js');

        // XTODO: This should throw an error loud and clear!
        expect(() => resolveModule(specifier, importer)).toThrow(`TODO missing error`);
    });

    // XTODO: Enable this test
    test.skip('throw an error when there is no entry file', () => {
        const specifier = 'foo/bar';
        const importer = fixture('errors/missing-dir-entry/index.js');

        // XTODO: This should throw an error loud and clear!
        expect(() => resolveModule(specifier, importer)).toThrow(`TODO missing error`);
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

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Invalid npm module record "{"npm":"missing-deps"}". Can't resolve "missing-deps" npm module from "${fixture(
                'errors/missing-npm-package/'
            )}"`
        );
    });

    test('throw when missing lwc config in resolved npm package', () => {
        const specifier = 'deps';
        const importer = fixture('errors/missing-npm-package-lwc-config/index.js');

        // XTODO: This error message should be different in this case here, the referenced package
        // doesn't include any LWC config. Because of this, we should throw an error stating that
        // the referenced package is not compatible with LWC.
        expect(() => resolveModule(specifier, importer)).toThrow(
            'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.'
        );
    });

    // XTODO: This error message is not helpfull, it would be great to add the location.
    test('throw when npm package has no expose property', () => {
        const specifier = 'npm-error';
        const importer = fixture('errors/npm/index.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.'
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
});
