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
    validateModuleRecord,
    LWC_CONFIG_FILE,
    isDirModuleRecord,
    isNpmModuleRecord,
    isAliasModuleRecord,
} from './utils';

export interface RegistryEntry {
    entry: string;
    specifier: string;
    scope: string;
}

export interface AliasModuleRecord {
    name: string;
    path: string;
}

export interface DirModuleRecord {
    dir: string;
}

export interface NpmModuleRecord {
    npm: string;
}

export interface ModuleResolverConfig {
    rootDir: string;
    modules: ModuleRecord[];
}

export type ModuleRecord = AliasModuleRecord | DirModuleRecord | NpmModuleRecord;
export interface LwcConfig {
    modules: ModuleRecord[];
}

export interface InnerResolverOptions {
    rootDir: string;
    scopeDir: string;
}

function resolveModulesFromDir(
    relativeModuleDir: string,
    opts: InnerResolverOptions
): RegistryEntry[] {
    const absModuleDir = path.isAbsolute(relativeModuleDir)
        ? relativeModuleDir
        : path.join(opts.rootDir, relativeModuleDir);
    const namespaces = fs.readdirSync(absModuleDir);
    const resolvedModules: RegistryEntry[] = [];

    namespaces.forEach(ns => {
        if (
            ns[0] !== '.' &&
            ns !== 'node_modules' &&
            fs.lstatSync(path.join(absModuleDir, ns)).isDirectory()
        ) {
            const namespacedModuleDir = path.join(absModuleDir, ns);
            const modules = fs.readdirSync(namespacedModuleDir);
            modules.forEach(moduleName => {
                const moduleDir = path.join(namespacedModuleDir, moduleName);
                const entry = getModuleEntry(moduleDir, moduleName);
                if (entry) {
                    const specifier = `${ns}/${moduleName}`;
                    resolvedModules.push({ entry, specifier, scope: opts.rootDir });
                }
            });
        }
    });

    return resolvedModules;
}

function resolveModulesFromNpm(packageName: string, opts: InnerResolverOptions): RegistryEntry[] {
    let resolvedModules: RegistryEntry[] = [];
    try {
        const pkgJsonPath = require.resolve(`${packageName}/package.json`, {
            paths: [opts.rootDir],
        });
        const packageDir = path.dirname(pkgJsonPath);
        const lwcConfigFile = path.join(packageDir, LWC_CONFIG_FILE);

        if (fs.existsSync(lwcConfigFile)) {
            resolvedModules = resolveModules({ rootDir: lwcConfigFile });
        } else {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            if (pkgJson.lwc) {
                resolvedModules = resolveModulesFromList(pkgJson.lwc.modules, {
                    rootDir: packageDir,
                    scopeDir: opts.rootDir,
                });
            }
        }
    } catch (e) {
        /*noop*/
    }

    return resolvedModules;
}

function resolveModulesFromList(
    modules: ModuleRecord[],
    opts: InnerResolverOptions
): RegistryEntry[] {
    const { rootDir, scopeDir } = opts;
    const resolvedModules: RegistryEntry[] = [];

    modules.forEach(moduleRecord => {
        validateModuleRecord(moduleRecord);

        if (isDirModuleRecord(moduleRecord)) {
            resolvedModules.push(...resolveModulesFromDir(moduleRecord.dir, opts));
            return;
        }

        if (isNpmModuleRecord(moduleRecord)) {
            resolvedModules.push(...resolveModulesFromNpm(moduleRecord.npm, opts));
            return;
        }

        if (isAliasModuleRecord(moduleRecord)) {
            const { name: specifier, path: modulePath } = moduleRecord;
            const entry = path.resolve(rootDir, modulePath);
            if (fs.existsSync(entry)) {
                resolvedModules.push({
                    entry,
                    specifier,
                    scope: scopeDir,
                });
            }
        }
    });

    return resolvedModules;
}

export function resolveModules(
    resolverConfig: Partial<ModuleResolverConfig> = {}
): RegistryEntry[] {
    const normalizedConfig = normalizeConfig(resolverConfig);
    const { rootDir, modules } = normalizedConfig;
    const rootConfig = loadConfig(rootDir);
    const mergedModules = mergeModules(modules, rootConfig.modules);
    return resolveModulesFromList(mergedModules, { rootDir, scopeDir: rootDir });
}
