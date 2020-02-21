/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModules, resolveModule } from '../index';

describe('resolve all modules', () => {
    const multiVersionFixture = path.join(__dirname, 'fixtures/multi-version');

    it('multi-version', () => {
        const modules = resolveModules({ rootDir: multiVersionFixture });
        expect(modules.length).toBe(4);

        const moduleSpecifiers = modules.map(m => m.specifier).sort();
        expect(moduleSpecifiers).toEqual(['fancy/bar', 'root/foo', 'ui/button', 'ui/button']);

        const buttons = modules
            .filter(m => m.specifier === 'ui/button')
            .sort((a, b) => a.scope.length - b.scope.length);
        const [btn1, btn2] = buttons;
        expect(btn1.scope).not.toBe(btn2.scope);
        expect(btn1.scope).toMatch(/multi-version$/); // endsWith('multi-version');
        expect(btn2.scope).toMatch(/fancy-components$/); // endsWith('fancy-components');
    });
});

describe('resolve modules iteratibly', () => {
    it('load the right version', () => {
        const multiVersionFixture = path.join(__dirname, 'fixtures/multi-version');
        const moduleImporter = path.join(multiVersionFixture, 'src/modules/root/foo/foo.js');
        const moduleImportee = 'fancy/bar';

        const moduleRecord = resolveModule(moduleImportee, moduleImporter);
        expect(moduleRecord).toBeDefined();
    });
});
