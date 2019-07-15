/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-env node */

import path from 'path';
import fs from 'fs';
import {
    getModuleEntry,
    normalizeConfig,
    loadConfig,
    mergeModules,
    LWC_CONFIG_FILE,
} from './utils';

export interface RegistryEntry {
    entry: string;
    specifier: string;
}

export interface ModuleRegistryMap {
    [key: string]: RegistryEntry;
}

export interface ModuleResolverConfig {
    rootDir: string;
    modules: ModuleId[];
}

export type ModuleId = string | [string, string];
export interface LwcConfig {
    modules: ModuleId[];
}

export function resolveModulesFromDir(modulesDir: string): RegistryEntry[] {
    const namespaces = fs.readdirSync(modulesDir);
    const resolvedModules: RegistryEntry[] = [];
    namespaces.forEach(ns => {
        // TODO: A better isDir() bellow
        if (!path.extname(ns)) {
            const namespacedModuleDir = path.join(modulesDir, ns);
            const modules = fs.readdirSync(namespacedModuleDir);
            modules.forEach(moduleName => {
                const moduleDir = path.join(namespacedModuleDir, moduleName);
                const entry = getModuleEntry(moduleDir, moduleName);
                if (entry) {
                    const specifier = `${ns}/${moduleName}`;
                    resolvedModules.push({ entry, specifier });
                }
            });
        }
    });

    return resolvedModules;
}

export function resolveModulesFromNpm(packageName: string): RegistryEntry[] {
    let resolvedModules: RegistryEntry[] = [];
    try {
        const pkgJsonPath = require.resolve(`${packageName}/package.json`);
        const packageDir = path.dirname(pkgJsonPath);
        const lwcConfigFile = path.join(packageDir, LWC_CONFIG_FILE);

        if (fs.existsSync(lwcConfigFile)) {
            resolvedModules = resolveModules({ rootDir: lwcConfigFile });
        } else {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            if (pkgJson.lwc) {
                resolvedModules = resolveModulesFromList(pkgJson.lwc.modules, { root: packageDir });
            }
        }
    } catch (e) {
        /*noop*/
    }

    return resolvedModules;
}

export function resolveModulesFromList(
    modules: ModuleId[],
    { root }: { root: string }
): RegistryEntry[] {
    const resolvedModules: RegistryEntry[] = [];
    modules.forEach(moduleId => {
        if (Array.isArray(moduleId)) {
            const [specifier, modulePath] = moduleId;
            const entry = path.resolve(root, modulePath);
            if (fs.existsSync(entry)) {
                resolvedModules.push({ entry, specifier });
            }
        } else {
            const absPath = path.resolve(root, moduleId);
            if (fs.existsSync(absPath)) {
                resolvedModules.push(...resolveModulesFromDir(absPath));
            } else {
                resolvedModules.push(...resolveModulesFromNpm(moduleId));
            }
        }
    });

    return resolvedModules;
}

export function resolveModules(
    resolverConfig: Partial<ModuleResolverConfig> = {}
): RegistryEntry[] {
    const normalizedConfig = normalizeConfig(resolverConfig);
    const rootConfig = loadConfig(normalizedConfig.rootDir);
    const modules = mergeModules(normalizedConfig.modules, rootConfig.modules);
    return resolveModulesFromList(modules, { root: normalizedConfig.rootDir });
}
