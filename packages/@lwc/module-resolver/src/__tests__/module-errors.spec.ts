/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { resolveModule } from '../index';
import { fixture } from './test-utils';

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

    // XTODO: This error message is not helpfull, it would be great to add the location.
    test('throw when unknown module', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-record/invalid-record.js');

        expect(() => resolveModule(specifier, importer)).toThrow(`Invalid moduleRecord type {}`);
    });

    // XTODO: This error message is not helpfull, it would be great to add the location.
    test('throw when alias module has not pass has no path', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-alias/invalid-alias.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Invalid moduleRecord type {"name":"something"}`
        );
    });

    test("throw when a module can't be resolved", () => {
        const specifier = 'empty';
        const importer = fixture('errors/empty/empty.js');

        expect(() => resolveModule(specifier, importer)).toThrow(
            `Unable to resolve "${specifier}" from "${importer}"`
        );
    });
});
