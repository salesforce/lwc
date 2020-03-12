/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

describe('standard resolution', () => {
    test('alias module', () => {
        const specifier = 'custom-module';
        const importer = fixture('custom-resolution/custom-override.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('custom-resolution'),
            entry: fixture('custom-resolution/custom/module.js'),
        });
    });

    // XTODO: add test to resolve multiple modules from the same directory
    test('dir module', () => {
        const specifier = 'ns/jsEntry';
        const importer = fixture('module-entries/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('module-entries'),
            entry: fixture('module-entries/modules/ns/jsEntry/jsEntry.js'),
        });
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

    // XTODO: Add test when node_modules can't be found.
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
