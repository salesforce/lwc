/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

describe('resolve mapped modules', () => {
    test('mapped alias', () => {
        const specifier = 'foo-common-util';
        const importer = fixture('mapping/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('mapping/node_modules/lwc-modules-foo'),
            entry: fixture('mapping/node_modules/lwc-modules-foo/src/common-util.js'),
        });
    });

    test('mapped npm alias', () => {
        const specifier = 'bar-common-util';
        const importer = fixture('mapping/index.js');

        expect(resolveModule(specifier, importer)).toEqual({
            specifier,
            scope: fixture('mapping/node_modules/lwc-modules-bar/node_modules/common-util'),
            entry: fixture(
                'mapping/node_modules/lwc-modules-bar/node_modules/common-util/src/common-util.js'
            ),
        });
    });

    test('validate multiple', () => {
        const specifier = 'alias-error';
        const importer = fixture('mapping/index.js');

        // XTODO: Improve this error message, we need details about which NPM module is invalid.
        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to apply mapping: The specifier "non-existing" is not exposed by the npm module`
        );
    });
});
