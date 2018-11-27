const path = require('path');
const lwcResolver = require('../index.js');

describe('resolve-src-modules', () => {
    describe('simple folder structure', () => {
        const simpleStructurePath = path.resolve(path.join(__dirname, 'fixtures/simple-folder-structure'));

        it('default resolution', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath);
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(2);
            expect(moduleNames).toContain('ns/simpleCmp', 'ns/simple-module');
        });
    });
});
