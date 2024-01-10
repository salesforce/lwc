export class ModuleGraph {
    // Mapping from <absolute file path> => "<namespace>/<componentname>/component.js"
    fileToModuleMap: Map<string, string> = new Map();
    // Mapping from "<namespace>/<componentname>/component.js" => <absolute file path>
    moduleToFileMap: Map<string, string> = new Map();

    getModuleByFile(path: string): string | undefined {
        return this.fileToModuleMap.get(path);
    }

    getFileByModulePath(modulePath: string): string | undefined {
        return this.moduleToFileMap.get(modulePath);
    }

    // Register the active paths that the client is interested in
    registerActivePaths(activeModules: string[]): void {
        activeModules.forEach((mod) => {
            // find the file that maps to the path
            const filePath = mod;
            this.fileToModuleMap.set(filePath, mod);
            this.moduleToFileMap.set(mod, filePath);
        });
    }
}
