/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

describe('multi version', () => {
    test('resolve "fancy/bar" from root', () => {
        const specifier = 'fancy/bar';
        const importer = fixture('multi-version/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('multi-version/node_modules/fancy-components'),
            entry: fixture(
                'multi-version/node_modules/fancy-components/src/modules/fancy/bar/bar.js'
            ),
        });
    });

    test('resolve "ui/button" from root', () => {
        const specifier = 'ui/button';
        const importer = fixture('multi-version/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('multi-version/node_modules/@ui/components'),
            entry: fixture(
                'multi-version/node_modules/@ui/components/src/modules/ui/button/button.js'
            ),
        });
    });

    test('resolve "ui/button" from "fancy-component" module', () => {
        const specifier = 'ui/button';
        const importer = fixture('multi-version/node_modules/fancy-components/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture(
                'multi-version/node_modules/fancy-components/node_modules/@ui/components'
            ),
            entry: fixture(
                'multi-version/node_modules/fancy-components/node_modules/@ui/components/src/modules/ui/button/button.js'
            ),
        });
    });

    // XTODO: This test shouldn't be part of the multi version suite.
    test('side load an alias record', () => {
        const specifier = 'custom-module';
        const importer = fixture('multi-version/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('multi-version'),
            entry: fixture('multi-version/src/custom/module.js'),
        });
    });
});
