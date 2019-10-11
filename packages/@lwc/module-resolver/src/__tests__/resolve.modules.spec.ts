/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import { resolveModules } from '../index';

const FIXTURE_MODULE_ENTRIES = ['ns/cssEntry', 'ns/htmlEntry', 'ns/jsEntry', 'ns/tsEntry'];

describe('resolve modules', () => {
    it('from directory', () => {
        const modules = resolveModules({
            rootDir: __dirname,
            modules: ['fixtures/module-entries'],
        });
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

    it('with configuration overrides resolving to custom modules', () => {
        const moduleDir = path.join(__dirname, 'fixtures/custom-resolution');
        const modules = resolveModules({
            rootDir: moduleDir,
            modules: [{ name: 'custom-module', path: 'custom-override.js' }],
        });
        const specifiers = modules.map(m => m.specifier);
        const entries = modules.map(m => m.entry);
        expect(specifiers).toStrictEqual(['custom-module']);
        expect(entries).toStrictEqual([path.join(moduleDir, 'custom-override.js')]);
    });

    it('from api configuration', () => {
        const modules = resolveModules({ modules: ['@lwc/engine'] });
        const specifiers = modules.map(m => m.specifier);
        expect(specifiers).toStrictEqual(['lwc']);
    });
});
