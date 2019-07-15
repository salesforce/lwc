/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModulesFromDir, resolveModules } from '../index';

const FIXTURE_MODULE_ENTRIES = ['ns/cssEntry', 'ns/htmlEntry', 'ns/jsEntry'];

describe('resolve modules', () => {
    it('from directory', () => {
        const moduleDir = path.join(__dirname, 'fixtures/module-entries');
        const modules = resolveModulesFromDir(moduleDir);
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toStrictEqual(FIXTURE_MODULE_ENTRIES);
    });

    it('from config', () => {
        const moduleDir = path.join(__dirname, 'fixtures');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toStrictEqual(FIXTURE_MODULE_ENTRIES);
    });

    it('from config resolving to npm', () => {
        const moduleDir = path.join(__dirname, 'fixtures/from-npm');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toStrictEqual(['lwc', 'wire-service', '@lwc/synthetic-shadow']);
    });

    it('from config resolving to custom modules', () => {
        const moduleDir = path.join(__dirname, 'fixtures/custom-resolution');
        const modules = resolveModules({ rootDir: moduleDir });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toStrictEqual(['custom-module']);
    });
});
