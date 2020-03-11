/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModule } from '../index';

describe('resolve mapped modules', () => {
    test('mapped alias', () => {
        const customImporter = path.join(__dirname, 'fixtures/mapping/index.js');
        const expectedImportee = 'foo-common-utils';
        const expectedEntry = path.join(
            __dirname,
            'fixtures/mapping/node_modules/lwc-modules-foo/src/common-util.js'
        );

        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe('common-util');
        expect(moduleRegistryEntry.entry).toBe(expectedEntry);
    });

    test('mapped npm alias', () => {
        const customImporter = path.join(__dirname, 'fixtures/mapping/index.js');
        const expectedImportee = 'bar-common-utils';
        const expectedEntry = path.join(
            __dirname,
            'fixtures/mapping/node_modules/lwc-modules-bar/node_modules/common-util/src/common-util.js'
        );

        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe('common-util');
        expect(moduleRegistryEntry.entry).toBe(expectedEntry);
    });

    test('multiple mappings to the same module', () => {
        const customImporter = path.join(__dirname, 'fixtures/mapping/index.js');
        const expectedEntry = path.join(
            __dirname,
            'fixtures/mapping/node_modules/multi-module-mapping/src/mod.js'
        );

        const moduleRegistryEntryA = resolveModule('a-mod', customImporter);

        expect(moduleRegistryEntryA).toBeDefined();
        expect(moduleRegistryEntryA.specifier).toBe('mod');
        expect(moduleRegistryEntryA.entry).toBe(expectedEntry);

        const moduleRegistryEntryB = resolveModule('b-mod', customImporter);

        expect(moduleRegistryEntryB).toBeDefined();
        expect(moduleRegistryEntryB.specifier).toBe('mod');
        expect(moduleRegistryEntryB.entry).toBe(expectedEntry);
    });
});
