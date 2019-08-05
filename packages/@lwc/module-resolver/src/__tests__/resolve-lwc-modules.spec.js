/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const lwcResolver = require('../index');
const nodePaths = require('../node-modules-paths');

describe('resolve-lwc-npm-modules', () => {
    it('resolve from npm: defaults', () => {
        const spy = jest.spyOn(nodePaths, 'defaultNodeModulePaths');
        lwcResolver.resolveLwcNpmModules();
        expect(spy).toHaveBeenCalledTimes(1);
    });
    it('resolve from npm: empty', () => {
        const resolverOptions = {
            moduleDirectories: ['empty'],
            rootDir: path.join(__dirname, 'fixtures'),
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(0);
    });
    it('resolve from npm', () => {
        const resolverOptions = {
            moduleDirectories: ['fake_node_modules'],
            rootDir: path.join(__dirname, 'fixtures'),
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(4);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining([
                'alias-fake-package',
                'fake/module1',
                'fake/module2',
                'other/resource',
            ])
        );
    });
    it('resolve from npm: modulePaths options', () => {
        const resolverOptions = {
            modulePaths: [path.join(__dirname, 'fixtures', 'fake_node_modules')],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(4);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining([
                'alias-fake-package',
                'fake/module1',
                'fake/module2',
                'other/resource',
            ])
        );
    });
    it('resolve from npm: ignorePattern', () => {
        const resolverOptions = {
            modulePaths: [path.join(__dirname, 'fixtures', 'fake_node_modules')],
            ignorePatterns: ['**/fake-module-package/**'],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(3);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining(['fake/module1', 'fake/module2', 'other/resource'])
        );
    });
    it('resolve from npm: modulePaths has direct package.json folder reference', () => {
        const resolverOptions = {
            modulePaths: [
                path.join(__dirname, 'fixtures', 'fake_node_modules', 'fake-multi-component'),
            ],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(3);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining(['fake/module1', 'fake/module2', 'other/resource'])
        );
    });
});
