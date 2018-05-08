const path = require('path');
const lwcResolver = require('../index.js');

describe('resolve-src-modules', () => {
    describe('simple folder structure', () => {
        const simpleStructurePath = path.resolve(path.join(__dirname, 'fixtures/simple-folder-structure'));

        it('default resolution', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath);
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(2);
            expect(moduleNames).toContain('simple/cmp', 'simple/module');
        });

        it('no namespace folder mapping', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath, { mapNamespaceFromPath: false });
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(2);
            expect(moduleNames).toContain('simple/cmp', 'simple/module');
        });

        it('allow unnamespaced with no folder mapping', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath, { mapNamespaceFromPath: false, allowUnnamespaced: true });
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(3);
            expect(moduleNames).toContain('simple/cmp', 'simple/module', 'x/unnamespaced');
        });

        it('namespace folder mapping', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath, { mapNamespaceFromPath: true });
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(3);
            expect(moduleNames).toContain('modules/simpleCmp', 'modules/simpleModule', 'modules/unnamespaced');
        });

        it('allow unnamespaced with folder mapping', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath, { mapNamespaceFromPath: true, allowUnnamespaced: true });
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(3);
            expect(moduleNames).toContain('modules/simpleCmp', 'modules/simpleModule', 'modules/unnamespaced');
        });

        it('ignore folder without mapping', () => {
            const modules = lwcResolver.resolveModulesInDir(simpleStructurePath, {
                mapNamespaceFromPath: false,
                allowUnnamespaced: false,
                ignoreFolderName: true
            });
            const moduleNames = Object.keys(modules);
            expect(moduleNames).toHaveLength(3);
            expect(moduleNames).toContain("simple/cmp", "simple/module", "module/name");
        });
    });
});
