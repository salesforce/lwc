/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture, NO_LWC_MODULE_FOUND_CODE } from './test-utils';

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

    test('resolve "ui/icon" from root', () => {
        const specifier = 'ui/icon';
        const importer = fixture('multi-version/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('multi-version/node_modules/@ui/components'),
            entry: fixture('multi-version/node_modules/@ui/components/src/modules/ui/icon/icon.js'),
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

    test('can\t resolve "ui/icon" from "fancy-component" module', () => {
        const specifier = 'ui/icon';
        const importer = fixture('multi-version/node_modules/fancy-components/index.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            NO_LWC_MODULE_FOUND_CODE,
            `Unable to resolve "${specifier}" from "${importer}"`
        );
    });
});
