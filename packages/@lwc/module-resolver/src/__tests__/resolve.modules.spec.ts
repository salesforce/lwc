/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import '../../scripts/jest/types';
import { resolveModule } from '../index';
import { RegistryType } from '../types';
import { fixture, LWC_CONFIG_ERROR_CODE } from './test-utils';

describe('parameters checks', () => {
    test('throw when importer is not a string', () => {
        expect(() => (resolveModule as any)()).toThrowErrorWithType(
            TypeError,
            'The importee argument must be a string. Received type undefined'
        );
    });

    test('throw when dirname is not a string', () => {
        expect(() => (resolveModule as any)('test')).toThrowErrorWithType(
            TypeError,
            'The dirname argument must be a string. Received type undefined'
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
        const dirname = fixture('custom-resolution');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: dirname,
            entry: fixture('custom-resolution/custom/module.js'),
        });
    });

    test("throw an error when the aliased path doesn't exists", () => {
        const specifier = 'aliased';
        const dirname = fixture('errors/missing-aliased-file');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Invalid alias module record "{"name":"aliased","path":"./missing.js"}", file "${fixture(
                'errors/missing-aliased-file/missing.js'
            )}" does not exist`
        );
    });
});

describe('dir resolution', () => {
    test('resolve a module form the dir', () => {
        const specifier = 'ns/jsEntry';
        const dirname = fixture('module-entries');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.dir,
            scope: dirname,
            entry: fixture('module-entries/modules/ns/jsEntry/jsEntry.js'),
        });
    });

    test("throw an error when the dir doesn't exists", () => {
        const specifier = 'test';
        const dirname = fixture('errors/missing-dir');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Invalid dir module record "{"dir":"./missing"}", directory ${fixture(
                'errors/missing-dir/missing'
            )} doesn't exists`
        );
    });

    test('throw an error when there is no entry file', () => {
        const specifier = 'foo/bar';
        const dirname = fixture('errors/missing-dir-entry');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Unable to find a valid entry point for "${fixture(
                'errors/missing-dir-entry/modules/foo/bar/bar'
            )}"`
        );
    });
});

describe('NPM resolution', () => {
    test('npm module', () => {
        const specifier = 'deps';
        const dirname = fixture('from-npm');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: fixture('from-npm/node_modules/deps'),
            entry: fixture('from-npm/node_modules/deps/deps.js'),
        });
    });

    test('scoped npm module', () => {
        const specifier = 'scoped-deps';
        const dirname = fixture('from-npm');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: fixture('from-npm/node_modules/@scoped/deps'),
            entry: fixture('from-npm/node_modules/@scoped/deps/scoped-deps.js'),
        });
    });

    test("throw when npm package doesn't exists", () => {
        const specifier = 'deps';
        const dirname = fixture('errors/missing-npm-package');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Invalid npm module record "{"npm":"missing-deps"}", "missing-deps" npm module can't be resolved`
        );
    });

    test('throw when missing lwc config in resolved npm package', () => {
        const specifier = 'deps';
        const dirname = fixture('errors/missing-npm-package-lwc-config');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-package-lwc-config/node_modules/deps'
            )}". Missing "modules" property for a npm config`
        );
    });

    test("throw when npm package config doesn't have modules property", () => {
        const specifier = 'exposed';
        const dirname = fixture('errors/missing-npm-module-config');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-module-config/node_modules/deps'
            )}". Missing "modules" property for a npm config`
        );
    });

    test("throw when npm package config doesn't have expose property", () => {
        const specifier = 'exposed';
        const dirname = fixture('errors/missing-npm-expose-config');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-expose-config/node_modules/deps'
            )}". Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains`
        );
    });

    test("throw when npm package can't resolve exposed module", () => {
        const specifier = 'exposed';
        const dirname = fixture('errors/missing-npm-exposed-module');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/missing-npm-exposed-module/node_modules/deps'
            )}". Unable to find "exposed" under npm package "deps"`
        );
    });

    describe('symlink', () => {
        test('resolve symlinked package', () => {
            const specifier = 'linked';
            const dirname = fixture('symlink/app');

            expect(resolveModule(specifier, dirname)).toEqual({
                specifier,
                type: RegistryType.alias,
                scope: fixture('symlink/app/node_modules/linked'),
                entry: fixture('symlink/app/node_modules/linked/linked.js'),
            });
        });

        test('resolve shared module from symlinked package', () => {
            const specifier = 'shared';
            const dirname = fixture('symlink/app/node_modules/linked');

            expect(resolveModule(specifier, dirname)).toEqual({
                specifier,
                type: RegistryType.alias,
                scope: fixture('symlink/app/node_modules/shared'),
                entry: fixture('symlink/app/node_modules/shared/shared.js'),
            });
        });
    });
});

describe('resolution override', () => {
    // XTODO: Add test about how the configs are merged and how overrides and existing modules are \
    // resolved.
    test('alias module override', () => {
        const specifier = 'no-config';
        const dirname = fixture('no-config');
        const options = {
            modules: [
                {
                    name: 'no-config',
                    path: fixture('no-config/custom/module.js'),
                },
            ],
        };

        expect(resolveModule(specifier, dirname, options)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: dirname,
            entry: fixture('no-config/custom/module.js'),
        });
    });

    test('dir module override', () => {
        const specifier = 'foo/bar';
        const dirname = fixture('no-config');
        const options = {
            rootDir: dirname,
            modules: [
                {
                    dir: 'modules',
                },
            ],
        };

        expect(resolveModule(specifier, dirname, options)).toEqual({
            specifier,
            type: RegistryType.dir,
            scope: dirname,
            entry: fixture('no-config/modules/foo/bar/bar.css'),
        });
    });

    test('throw when the option module is invalid', () => {
        const dirname = fixture('no-config');
        const opts: any = { modules: [{}] };

        expect(() => resolveModule('test', dirname, opts)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Unknown module record "{}"`
        );
    });

    test('throw when the module record is non-object', () => {
        const dirname = fixture('no-config');
        const opts: any = { modules: ['foo/test'] };

        expect(() => resolveModule('test', dirname, opts)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${dirname}". Invalid module record. Module record must be an object, instead got "foo/test".`
        );
    });
});
