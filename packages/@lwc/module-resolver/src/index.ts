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
import { nodeModulePaths, defaultNodeModulePaths } from './node-modules-paths';

const DEFAULT_IGNORE = ['**/node_modules/**', '**/__tests__/**'];
const PACKAGE_PATTERN = ['*/*/package.json', '*/package.json', 'package.json'];
const MODULE_ENTRY_PATTERN = `**/*.([jt]s|html|css)`;
const LWC_CONFIG_FILE = '.lwcrc';

export interface RegistryEntry {
    entry: string;
    moduleSpecifier: string;
    moduleName?: string;
    moduleNamespace?: string;
}

export interface ModuleResolverConfig {
    moduleDirectories: string[];
    rootDir: string;
    modulePaths: string[];
    ignorePatterns?: string[];
}

export interface LWCModules {
    [moduleSpecifier: string]: RegistryEntry;
}

interface FlatEntry {
    path: string;
}
interface ResolverParams {
    mappings: LWCModules;
    visited: Set<string>;
    moduleRoot: string;
    lwcConfig: LWCConfig;
    ignore: string[];
}

export interface LWCConfigModuleMap {
    [moduleSpecifier: string]: string;
}
type LWCConfigModuleMapOrPath = LWCConfigModuleMap | string;

interface LWCConfig {
    prod?: boolean;
    compat?: boolean;
    nativeShadow?: boolean;
    modules?: [string | LWCConfigModuleMap];
}

function createRegistryEntry(
    entry: string,
    moduleSpecifier: string,
    moduleName: string,
    moduleNamespace: string
): RegistryEntry {
    return { entry, moduleSpecifier, moduleName, moduleNamespace };
}

function loadLwcConfig(modulePath: string): LWCConfig | undefined {
    const packageJsonPath = path.join(modulePath, 'package.json');
    const lwcConfigPath = path.join(modulePath, LWC_CONFIG_FILE);
    let config: LWCConfig | undefined;
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
    return visited.has(module);
}

function expandModuleDirectories({
    moduleDirectories,
    rootDir,
    modulePaths,
}: Partial<ModuleResolverConfig>) {
    if (modulePaths) {
        return modulePaths;
    }
    if (!rootDir) {
        return defaultNodeModulePaths();
    }

    return nodeModulePaths(rootDir, moduleDirectories);
}

function resolveModules(
    modules: [LWCConfigModuleMapOrPath] | LWCConfigModuleMapOrPath,
    opts: ResolverParams
) {
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

export function resolveLwcNpmModules(options: Partial<ModuleResolverConfig> = {}): LWCModules {
    const visited = new Set<string>();
    const modulePaths = expandModuleDirectories(options);
    const ignore = options.ignorePatterns || DEFAULT_IGNORE;

    return modulePaths.reduce((m, nodeModulesDir) => {
        return glob
            .sync<FlatEntry>(PACKAGE_PATTERN, {
                cwd: nodeModulesDir,
                ignore,
                transform: entry =>
                    typeof entry === 'string' ? { path: entry } : { path: entry.path },
            })
            .reduce((mappings: LWCModules, { path: file }) => {
                const moduleRoot = path.dirname(path.join(nodeModulesDir, file));
                const lwcConfig = loadLwcConfig(moduleRoot);

                if (lwcConfig && lwcConfig.modules) {
                    resolveModules(lwcConfig.modules, {
                        mappings,
                        visited,
                        moduleRoot,
                        lwcConfig,
                        ignore,
                    });
                }

                return mappings;
            }, m);
    }, {});
}
