/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

describe('parameters checks', () => {
    test('throw when no importee', () => {
        expect(() => (resolveModule as any)()).toThrow('Invalid importee undefined');
    });

    test('throw when no importee', () => {
        // XTODO: The error message is not valid
        expect(() => (resolveModule as any)('test')).toThrow(
            'The "path" argument must be of type string. Received undefined'
        );
    });

    test('throw when incorrect moduleRecord type', () => {
        const opts = { modules: [{ unknownType: 'test ' }] };
        expect(() => (resolveModule as any)('test', '', opts)).toThrow(
            'Invalid moduleRecord type {"unknownType":"test "}'
        );
    });
});

describe('resolution errors', () => {
    test('throw if no lwc config is present in the path', () => {
        const specifier = 'missing';
        const importer = '/non-existing/non-existent.js';

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to find any LWC configuration file from ${importer}`
        );
    });

    test('throw when modules are empty', () => {
        const specifier = 'empty';
        const importer = fixture('errors/empty/empty.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve ${specifier} from ${importer}`
        );
    });

    // XTODO: Reenable the test once fixed.
    test.skip('throw when alias has no path', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-alias/invalid-alias.js');

        // XTODO: This shouldn't fail the same way than the rest.
        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve ${specifier} from ${importer}`
        );
    });

    // XTODO: Should not be covered here.
    test('throw when no module record exists', () => {
        const specifier = 'does-not-exist';
        const importer = fixture('custom-resolution/custom-override.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve ${specifier} from ${importer}`
        );
    });

    test('throw when npm package has no expose property', () => {
        const specifier = 'npm-error';
        const importer = fixture('errors/npm/index.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.'
        );
    });
});
