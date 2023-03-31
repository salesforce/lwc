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

describe('resolve mapped modules', () => {
    test('mapped alias', () => {
        const specifier = 'foo-common-util';
        const dirname = fixture('mapping');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: fixture('mapping/node_modules/@lwc/lwc-modules-foo'),
            entry: fixture('mapping/node_modules/@lwc/lwc-modules-foo/src/common-util.js'),
        });
    });

    test('mapped npm alias', () => {
        const specifier = 'bar-common-util';
        const dirname = fixture('mapping');

        expect(resolveModule(specifier, dirname)).toEqual({
            specifier,
            type: RegistryType.alias,
            scope: fixture('mapping/node_modules/@lwc/lwc-modules-bar/node_modules/common-util'),
            entry: fixture(
                'mapping/node_modules/@lwc/lwc-modules-bar/node_modules/common-util/src/common-util.js'
            ),
        });
    });

    test('validate multiple', () => {
        const specifier = 'alias-error';
        const dirname = fixture('mapping');

        expect(() => resolveModule(specifier, dirname)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'mapping/node_modules/@lwc/multi-module-mapping'
            )}". Unable to apply mapping: The specifier "non-existing" is not exposed by the npm module`
        );
    });
});
