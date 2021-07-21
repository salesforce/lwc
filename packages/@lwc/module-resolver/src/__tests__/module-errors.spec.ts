/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import '../../scripts/jest/types';
import { resolveModule } from '../index';
import { fixture, NO_LWC_MODULE_FOUND_CODE, LWC_CONFIG_ERROR_CODE } from './test-utils';

describe('resolution errors', () => {
    test('throw when no lwc config is present in the path', () => {
        const specifier = 'missing';
        const importer = '/errors/non/existent/module.js';

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${importer}". Unable to find any LWC configuration file`
        );
    });

    test('throw when a lwc.config.json without package.json', () => {
        const specifier = 'missing';
        const importer = fixture('errors/invalid-lwc-config/invalid-lwc-config.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/invalid-lwc-config'
            )}". "lwc.config.json" must be at the package root level along with the "package.json"`
        );
    });

    test('throw when unknown module', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-record/invalid-record.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/invalid-record'
            )}". Unknown module record "{}"`
        );
    });

    test('throw when alias module has not pass has no path', () => {
        const specifier = 'something';
        const importer = fixture('errors/invalid-alias/invalid-alias.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            LWC_CONFIG_ERROR_CODE,
            `Invalid LWC configuration in "${fixture(
                'errors/invalid-alias'
            )}". Unknown module record "{"name":"something"}"`
        );
    });

    test("throw when a module can't be resolved", () => {
        const specifier = 'empty';
        const importer = fixture('errors/empty/empty.js');

        expect(() => resolveModule(specifier, importer)).toThrowErrorWithCode(
            NO_LWC_MODULE_FOUND_CODE,
            `Unable to resolve "${specifier}" from "${importer}"`
        );
    });
});
