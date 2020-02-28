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
        expect(moduleRecord).toBeDefined();
    });
});
