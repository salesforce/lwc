/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModule } from '../index';

describe('resolve individual module', () => {
    test('throw when no modules are empty', () => {
        const customImporter = path.join(__dirname, 'fixtures/errors/empty/empty.js');
        function run() {
            const expectedImportee = 'empty';
            resolveModule(expectedImportee, customImporter);
        }

        expect(run).toThrow('Unable to resolve empty from ' + customImporter);
    });

    test('throw when alias has no path', () => {
        const customImporter = path.join(
            __dirname,
            'fixtures/errors/invalid-alias/invalid-alias.js'
        );

        function run() {
            const expectedImportee = 'invalid-alias';

            resolveModule(expectedImportee, customImporter);
        }

        expect(run).toThrow('Unable to resolve invalid-alias from ' + customImporter);
    });

    test('throw with invalid module record', () => {
        const customImporter = path.join(
            __dirname,
            'fixtures/errors/invalid-alias/invalid-record.js'
        );

        function run() {
            const expectedImportee = 'invalid-record';

            resolveModule(expectedImportee, customImporter);
        }

        expect(run).toThrow('Unable to resolve invalid-record from ' + customImporter);
    });

    test('throw when no module record exists', () => {
        const customImporter = path.join(
            __dirname,
            'fixtures/custom-resolution/custom-override.js'
        );

        function run() {
            resolveModule('does-not-exist', customImporter);
        }

        expect(run).toThrow('Unable to resolve does-not-exist from ' + customImporter);
    });

    test('throw when npm package has no expose property', () => {
        function run() {
            const customImporter = path.join(__dirname, 'fixtures/errors/npm/index.js');
            resolveModule('npm-error', customImporter);
        }

        expect(run).toThrow(
            new Error(
                'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.'
            )
        );
    });

    test('throw on null importee', () => {
        function run() {
            resolveModule(null);
        }
        expect(run).toThrow('Invalid importee');
    });

    test('throw on relative paths', () => {
        function run() {
            resolveModule('./some-path');
        }
        expect(run).toThrow('Unable to resolve relative paths for ./some-path');
    });

    test('throw on absolute paths', () => {
        function run() {
            resolveModule('/some-path');
        }
        expect(run).toThrow('Unable to resolve relative paths for /some-path');
    });

    test('throw on invalid mdoule record', () => {
        function run() {
            const customImporter = path.join(__dirname, 'fixtures/errors/empty/empty.js');
            const expectedImportee = 'empty';

            resolveModule(expectedImportee, customImporter, {
                modules: [{}],
            });
        }

        expect(run).toThrow('Invalid moduleRecord type');
    });
});
