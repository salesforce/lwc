/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModule } from '../index';

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
