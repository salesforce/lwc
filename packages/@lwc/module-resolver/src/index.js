/* eslint-env node */
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const nodeModulePaths = require('./node-modules-paths');

const DEFAULT_NS = 'x';
const PACKAGE_PATTERN = `**/*/package.json`;
const MODULE_EXTENSION = '.js';
const MODULE_ENTRY_PATTERN = `**/*${MODULE_EXTENSION}`;
const LWC_CONFIG_FILE = '.lwcrc';

function loadLwcConfig(modulePath) {
    const packageJsonPath = path.join(modulePath, 'package.json');
    const lwcConfigPath = path.join(modulePath, LWC_CONFIG_FILE);
    const jsonPkg = require(packageJsonPath);
    let config;
    try {
        config = fs.readFileSync(lwcConfigPath, 'utf8');
    } catch(e) {
        config = jsonPkg.lwc;
    }

    return config;
}

function resolveModulesInDir(fullPathDir, { ignoreFolderName } = {}) {
    return glob.sync(MODULE_ENTRY_PATTERN, { cwd: fullPathDir }).reduce((mappings, file) => {
        const fileName = path.basename(file, MODULE_EXTENSION);
        const rootDir = path.dirname(file);
        const rootParts = rootDir.split(path.sep);
        const registry = {
            entry: path.join(fullPathDir, file),
            moduleSpecifier: null,
            moduleName: null,
            moduleNamespace: DEFAULT_NS
        };

        const dirModuleName = rootParts.pop();
        const dirModuleNamespace = rootParts.pop();
        if (dirModuleNamespace && dirModuleName === fileName) {
            registry.moduleName = fileName;
            registry.moduleNamespace = dirModuleNamespace.toLowerCase();
            registry.moduleSpecifier = `${dirModuleNamespace}/${fileName}`;
            mappings[registry.moduleSpecifier] = registry;
        }
        return mappings;
    }, {});
}

function hasModuleBeenVisited(module, visited) {
    if (visited.has(module)) {
        console.log(`Package ${module} already resolved`);
        return true;
    }
    return false;
}

function expandModuleDirectories({ moduleDirectories, rootDir } = {}) {
    if (!moduleDirectories && !rootDir) {
        return module.paths;
    }

    return nodeModulePaths(rootDir || __dirname, { moduleDirectory: moduleDirectories });
}

function resolveModules(modules, opts) {
    if (Array.isArray(modules)) {
        modules.forEach((modulePath) => resolveModules(modulePath, opts));
    } else {
        const { mappings, visited, moduleRoot, lwcConfig } = opts;
        if (typeof modules === 'string') {
            const packageEntries = resolveModulesInDir(path.join(moduleRoot, modules), lwcConfig);
            Object.keys(packageEntries).forEach((moduleName) => {
                if (!hasModuleBeenVisited(moduleName, visited)) {
                    mappings[moduleName] = packageEntries[moduleName];
                    visited.add(moduleName);
                }
            });
        } else {
            Object.keys(modules).forEach((moduleName) => {
                if (!hasModuleBeenVisited(moduleName, visited)) {
                    const modulePath = path.join(moduleRoot, modules[moduleName]);
                    mappings[moduleName] = { moduleSpecifier: moduleName, entry: modulePath };
                    visited.add(moduleName);
                }
            });
        }
    }
}

function resolveLwcNpmModules(options = {}) {
    const visited = new Set();
    const modulePaths = expandModuleDirectories(options);

    return modulePaths.reduce((m, nodeModulesDir) => {
        return glob.sync(PACKAGE_PATTERN, { cwd: nodeModulesDir, ignore: ['**/node_modules/**'] }).reduce((mappings, file) => {
            const moduleRoot = path.dirname(path.join(nodeModulesDir, file));
            const lwcConfig = loadLwcConfig(moduleRoot);

            if (lwcConfig) {
                resolveModules(lwcConfig.modules, {mappings, visited, moduleRoot, lwcConfig });
            }

            return mappings;
        }, m);
    }, {});
}

exports.resolveLwcNpmModules = resolveLwcNpmModules
exports.resolveModulesInDir = resolveModulesInDir;
