/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModules, resolveModule } from '../index';

const FIXTURE_MODULE_ENTRIES = ['ns/cssEntry', 'ns/htmlEntry', 'ns/jsEntry', 'ns/tsEntry'];

describe('resolve modules', () => {
    it('from directory', () => {
        const modules = resolveModules({
            rootDir: path.join(__dirname, 'fixtures/module-entries'),
            modules: [{ dir: 'modules' }],
        });

        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toEqual(FIXTURE_MODULE_ENTRIES);
    });

    it('from config', () => {
        const moduleDir = path.join(__dirname, 'fixtures/module-entries/');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toEqual(FIXTURE_MODULE_ENTRIES);
    });

    it('from config resolving to npm', () => {
        const moduleDir = path.join(__dirname, 'fixtures/from-npm');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toEqual(['lwc', 'wire-service', '@lwc/synthetic-shadow']);
    });

    it('from config resolving to custom modules', () => {
        const moduleDir = path.join(__dirname, 'fixtures/custom-resolution');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toEqual(['custom-module']);
    });

    it('with configuration overrides resolving to custom modules', () => {
        const moduleDir = path.join(__dirname, 'fixtures/custom-resolution');
        const modules = resolveModules({
            rootDir: moduleDir,
            modules: [{ name: 'custom-module', path: 'custom-override.js' }],
        });
        const specifiers = modules.map(m => m.specifier);
        const entries = modules.map(m => m.entry);
        expect(specifiers).toEqual(['custom-module']);
        expect(entries).toEqual([path.join(moduleDir, 'custom-override.js')]);
    });

    it('from api configuration', () => {
        const resolvedModules = resolveModules({ modules: [{ npm: '@lwc/engine' }] });
        const specifiers = resolvedModules.map(m => m.specifier);
        expect(specifiers).toEqual(['lwc']);
    });
});

describe('resolve individual module', () => {
    test('iterative resolution alias', () => {
        const customImporter = path.join(
            __dirname,
            'fixtures/custom-resolution/custom-override.js'
        );
        const expectedImportee = 'custom-module';
        const expectedEntry = path.join(__dirname, 'fixtures/custom-resolution/custom/module.js');

        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe(expectedImportee);
        expect(moduleRegistryEntry.entry).toBe(expectedEntry);
    });

    test('iterative resolution npm', () => {
        const customImporter = path.join(__dirname, 'fixtures/from-npm/src/modules/test.js');
        const expectedImportee = 'lwc';
        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe(expectedImportee);
    });

    test('iterative resolution dir', () => {
        const customImporter = path.join(__dirname, 'fixtures/module-entries/index.js');
        const expectedImportee = 'ns/tsEntry';
        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe(expectedImportee);
    });
});
