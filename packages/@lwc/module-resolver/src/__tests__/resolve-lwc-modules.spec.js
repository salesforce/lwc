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
            ignorePatterns: [],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(0);
    });
    it('resolve from npm', () => {
        const resolverOptions = {
            moduleDirectories: ['fake_node_modules'],
            rootDir: path.join(__dirname, 'fixtures'),
            ignorePatterns: [],
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
            ignorePatterns: [],
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
    it('resolve from npm: modulePaths has direct package.json folder reference', () => {
        const resolverOptions = {
            modulePaths: [
                path.join(__dirname, 'fixtures', 'fake_node_modules', 'fake-multi-component'),
            ],
            ignorePatterns: [],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(3);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining(['fake/module1', 'fake/module2', 'other/resource'])
        );
    });
    it('resolve from npm: ignorePatterns', () => {
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
    it('resolve from npm: ignorePatterns applies to paths within directories', () => {
        const root = path.join(__dirname, 'fixtures', 'fake_node_modules', 'fake-multi-component');
        const resolverOptions = {
            modulePaths: [root],
            ignorePatterns: ['**/fake-multi-component/src/fake/module2/**'],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        //normalize paths
        Object.values(lwcModules).forEach(entry => {
            entry.entry = entry.entry.substring(root.length + 1);
        });

        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(3);

        expect(lwcModuleNames).toHaveLength(3);
        expect(lwcModuleNames).toEqual(
            expect.arrayContaining(['fake/module1', 'fake/module2', 'other/resource'])
        );

        const entryPaths = Object.values(lwcModules).map(e => e.entry);
        expect(entryPaths).toEqual(
            expect.arrayContaining([
                'src/fake/module1/module1.js',
                'src-dup/fake/module2/module2.js',
                'other/resource.js',
            ])
        );
    });
    it('resolve from npm: ignorePatterns applies to explicit mappings', () => {
        const root = path.join(__dirname, 'fixtures', 'fake_node_modules', 'fake-multi-component');
        const resolverOptions = {
            modulePaths: [root],
            ignorePatterns: ['**/other/resource.js'],
        };

        const lwcModules = lwcResolver.resolveLwcNpmModules(resolverOptions);
        //normalize paths
        Object.values(lwcModules).forEach(entry => {
            entry.entry = entry.entry.substring(root.length + 1);
        });

        const lwcModuleNames = Object.keys(lwcModules);
        expect(lwcModuleNames).toHaveLength(2);

        expect(lwcModuleNames).toHaveLength(2);
        expect(lwcModuleNames).toEqual(expect.arrayContaining(['fake/module1', 'fake/module2']));

        const entryPaths = Object.values(lwcModules).map(e => e.entry);
        expect(entryPaths).toEqual(
            expect.arrayContaining(['src/fake/module1/module1.js', 'src/fake/module2/module2.js'])
        );
    });
});
