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
        const expectedImportee = 'foo-common-util';
        const expectedEntry = path.join(
            __dirname,
            'fixtures/mapping/node_modules/lwc-modules-foo/src/common-util.js'
        );

        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe(expectedImportee);
        expect(moduleRegistryEntry.entry).toBe(expectedEntry);
    });

    test('mapped npm alias', () => {
        const customImporter = path.join(__dirname, 'fixtures/mapping/index.js');
        const expectedImportee = 'bar-common-util';
        const expectedEntry = path.join(
            __dirname,
            'fixtures/mapping/node_modules/lwc-modules-bar/node_modules/common-util/src/common-util.js'
        );

        const moduleRegistryEntry = resolveModule(expectedImportee, customImporter);

        expect(moduleRegistryEntry).toBeDefined();
        expect(moduleRegistryEntry.specifier).toBe(expectedImportee);
        expect(moduleRegistryEntry.entry).toBe(expectedEntry);
    });

    test('validate multiple', () => {
        const customImporter = path.join(__dirname, 'fixtures/mapping/index.js');
        function run() {
            resolveModule('alias-error', customImporter);
        }

        expect(run).toThrow(
            new Error(
                'Unable to apply mapping: The specifier "non-existing" is not exposed by the npm module'
            )
        );
    });
});
