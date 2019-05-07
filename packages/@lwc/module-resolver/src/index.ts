/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-env node */

import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';
import nodeModulePaths from './node-modules-paths';

const DEFAULT_IGNORE = ['**/node_modules/**', '**/__tests__/**'];
const PACKAGE_PATTERN = ['*/*/package.json', '*/package.json', 'package.json'];
const MODULE_ENTRY_PATTERN = `**/*.([jt]s|html|css)`;
const LWC_CONFIG_FILE = '.lwcrc';

export interface RegistryEntry {
    entry: string;
    moduleSpecifier: string;
    moduleName: string;
    moduleNamespace: string;
}

export interface ModuleResolverConfig {
    moduleDirectories: string[];
    rootDir: string;
    modulePaths: string[];
    ignorePatterns?: string[];
}

interface FlatEntry {
    path: string;
}

function createRegistryEntry(entry, moduleSpecifier, moduleName, moduleNamespace): RegistryEntry {
    return { entry, moduleSpecifier, moduleName, moduleNamespace };
}

function loadLwcConfig(modulePath) {
    const packageJsonPath = path.join(modulePath, 'package.json');
    const lwcConfigPath = path.join(modulePath, LWC_CONFIG_FILE);
    let config;
    try {
        config = JSON.parse(fs.readFileSync(lwcConfigPath, 'utf8'));
    } catch (ignore) {
        // ignore
    }
    if (!config) {
        try {
            config = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).lwc;
        } catch (ignore) {
            // ignore
        }
    }
    return config;
}

export function resolveModulesInDir(absPath: string): { [name: string]: RegistryEntry } {
    return glob
        .sync<FlatEntry>(MODULE_ENTRY_PATTERN, {
            cwd: absPath,
            transform: entry =>
                typeof entry === 'string' ? { path: entry } : { path: entry.path },
        })
        .reduce((mappings, { path: file }) => {
            const ext = path.extname(file);
            const fileName = path.basename(file, ext);
            const rootDir = path.dirname(file);
            const rootParts = rootDir.split('/'); // the glob library normalizes paths to forward slashes only - https://github.com/isaacs/node-glob#windows
            const entry = path.join(absPath, file);

            const dirModuleName = rootParts.pop();
            const dirModuleNamespace = rootParts.pop();
            if (dirModuleNamespace && dirModuleName === fileName) {
                const registryNode = createRegistryEntry(
                    entry,
                    `${dirModuleNamespace}/${fileName}`,
                    fileName,
                    dirModuleNamespace.toLowerCase()
                );
                mappings[registryNode.moduleSpecifier] = registryNode;
            }

            return mappings;
        }, {});
}

function hasModuleBeenVisited(module, visited) {
    if (visited.has(module)) {
        /* eslint-disable-next-line no-console */
        console.log(`Package ${module} already resolved`);
        return true;
    }
    return false;
}

function expandModuleDirectories({
    moduleDirectories,
    rootDir,
    modulePaths,
}: Partial<ModuleResolverConfig> = {}) {
    if (modulePaths) {
        return modulePaths;
    }
    if (!moduleDirectories && !rootDir) {
        // paths() is spec'd to return null only for built-in node
        // modules like 'http'. To be safe, return empty array in
        // instead of null in this case.
        return require.resolve.paths('.') || [];
    }

    return nodeModulePaths(rootDir || __dirname, moduleDirectories);
}

function resolveModules(modules, opts) {
    if (Array.isArray(modules)) {
        modules.forEach(modulePath => resolveModules(modulePath, opts));
    } else {
        const { mappings, visited, moduleRoot } = opts;
        if (typeof modules === 'string') {
            const packageEntries = resolveModulesInDir(path.join(moduleRoot, modules));
            Object.keys(packageEntries).forEach(moduleName => {
                if (!hasModuleBeenVisited(moduleName, visited)) {
                    mappings[moduleName] = packageEntries[moduleName];
                    visited.add(moduleName);
                }
            });
        } else {
            Object.keys(modules).forEach(moduleName => {
                if (!hasModuleBeenVisited(moduleName, visited)) {
                    const modulePath = path.join(moduleRoot, modules[moduleName]);
                    mappings[moduleName] = { moduleSpecifier: moduleName, entry: modulePath };
                    visited.add(moduleName);
                }
            });
        }
    }
}

export function resolveLwcNpmModules(options: Partial<ModuleResolverConfig> = {}) {
    const visited = new Set();
    const modulePaths = expandModuleDirectories(options);
    return modulePaths.reduce((m, nodeModulesDir) => {
        return glob
            .sync<FlatEntry>(PACKAGE_PATTERN, {
                cwd: nodeModulesDir,
                ignore: options.ignorePatterns || DEFAULT_IGNORE,
                transform: entry =>
                    typeof entry === 'string' ? { path: entry } : { path: entry.path },
            })
            .reduce((mappings, { path: file }) => {
                const moduleRoot = path.dirname(path.join(nodeModulesDir, file));
                const lwcConfig = loadLwcConfig(moduleRoot);

                if (lwcConfig) {
                    resolveModules(lwcConfig.modules, { mappings, visited, moduleRoot, lwcConfig });
                }

                return mappings;
            }, m);
    }, {});
}
