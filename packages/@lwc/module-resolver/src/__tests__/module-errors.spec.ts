/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

describe('parameters checks', () => {
    test('throw when importer is not a string', () => {
        expect(() => (resolveModule as any)()).toThrow(
            'The importee argument must be a string. Received type undefined'
        );
    });

    test('throw when no importee is not a string', () => {
        expect(() => (resolveModule as any)('test')).toThrow(
            'The importer argument must be a string. Received type undefined'
        );
    });

    test('throw when passing a relative path', () => {
        expect(() => resolveModule('./test', '.')).toThrow(
            'The importee argument must be a valid LWC module name. Received "./test"'
        );
    });

    test('throw when passing an absolute path', () => {
        expect(() => resolveModule('/test', '.')).toThrow(
            'The importee argument must be a valid LWC module name. Received "/test"'
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
    test('throw when no lwc config is present in the path', () => {
        const specifier = 'missing';
        const importer = '/errors/non/existent/module.js';

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to find any LWC configuration file from "${importer}"`
        );
    });

    test('throw when a lwc.config.json without package.json', () => {
        const specifier = 'missing';
        const importer = fixture('errors/invalid-lwc-config/invalid-lwc-config.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `"lwc.config.json" must be at the package root level along with the "package.json". No "package.json" found at "${fixture(
                'errors/invalid-lwc-config/package.json'
            )}"`
        );
    });

    test("throw when a module can't be resolved", () => {
        const specifier = 'empty';
        const importer = fixture('errors/empty/empty.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve "${specifier}" from "${importer}"`
        );
    });

    // XTODO: Reenable the test once fixed.
    test.skip('throw when alias has no path', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-alias/invalid-alias.js');

        // XTODO: This shouldn't fail the same way than the rest.
        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve "${specifier}" from "${importer}"`
        );
    });

    // XTODO: Should not be covered here.
    test('throw when no module record exists', () => {
        const specifier = 'does-not-exist';
        const importer = fixture('custom-resolution/custom-override.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve "${specifier}" from "${importer}"`
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
