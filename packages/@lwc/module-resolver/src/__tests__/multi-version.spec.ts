/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModule } from '../index';

describe('resolve modules iteratibly', () => {
    it('load the right version', () => {
        const multiVersionFixture = path.join(__dirname, 'fixtures/multi-version');
        const moduleImporter = path.join(multiVersionFixture, 'src/modules/root/foo/foo.js');
        const moduleImportee = 'fancy/bar';

        const moduleRecord = resolveModule(moduleImportee, moduleImporter);

        expect(moduleRecord).toEqual({
            entry: path.join(
                __dirname,
                'fixtures/multi-version/node_modules/fancy-components/src/modules/fancy/bar/bar.js'
            ),
            scope: path.join(__dirname, 'fixtures/multi-version/node_modules/fancy-components'),
            specifier: 'fancy/bar',
        });
    });

    it('side load an alias record', () => {
        const moduleImporter = path.join(__dirname, 'fixtures/multi-version/index.js');
        const moduleImportee = 'custom-module';

        const moduleRecord = resolveModule(moduleImportee, moduleImporter);

        expect(moduleRecord).toEqual({
            specifier: moduleImportee,
            scope: path.join(__dirname, 'fixtures/multi-version'),
            entry: path.join(__dirname, 'fixtures/multi-version/src/custom/module.js'),
        });
    });
});
