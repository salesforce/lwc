/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const lwcResolver = require('../index');

describe('resolve-src-modules', () => {
    describe('simple folder structure', () => {
        const simpleStructurePath = path.resolve(
            path.join(__dirname, 'fixtures/simple-folder-structure')
        );

        it('default resolution', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath);
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(2);
            expect(moduleNames).toContain('ns/simpleCmp', 'ns/simple-module');
        });
    });
});
