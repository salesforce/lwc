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
    InnerResolverOptions,
    RegistryEntry,
    AliasModuleRecord,
    ModuleRecord,
    ModuleResolverConfig,
    NpmModuleRecord,
} from './types';
import {
    getModuleEntry,
    normalizeConfig,
    getLwcConfig,
    findFirstUpwardConfigPath,
    mergeModules,
    validateModuleRecord,
    isDirModuleRecord,
    isNpmModuleRecord,
    isAliasModuleRecord,
    validateNpmConfig,
    loadPackageJson,
} from './utils';

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
                    resolvedModules.push({
                        entry,
                        specifier,
                        scope: opts.rootDir,
                        version: opts.version,
                    });
                }
            });
        }
    });

    return resolvedModules;
}

function resolveModulesFromNpm(
    npmModuleRecord: NpmModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry[] {
    const { npm, map: aliasMapping } = npmModuleRecord;
    const pkgJsonPath = require.resolve(`${npm}/package.json`, { paths: [opts.rootDir] });
    const packageDir = path.dirname(pkgJsonPath);
    const lwcConfig = getLwcConfig(packageDir);
    const { version } = loadPackageJson(packageDir);
    const innerOpts = { ...opts, rootDir: packageDir, scopeDir: opts.rootDir, version };
    const resolvedModules: RegistryEntry[] = [];

    if (lwcConfig?.modules) {
        validateNpmConfig(lwcConfig);
        const exposedModules = lwcConfig.expose || [];
        const modules = resolveModulesFromList(lwcConfig.modules, innerOpts);
        if (!opts.skipExposeFilter) {
            resolvedModules.push(...modules.filter(m => exposedModules.includes(m.specifier)));
        } else {
            resolvedModules.push(...modules);
        }

        // Remapping some of the modules exposed
        if (aliasMapping) {
            resolvedModules.forEach(resolvedModule => {
                Object.keys(aliasMapping).forEach(oldSpecififer => {
                    if (resolvedModule.specifier === oldSpecififer) {
                        resolvedModule.specifier = aliasMapping[oldSpecififer];
                    }
                });
            });
        }
    }

    return resolvedModules;
}

function resolveModulesFromAlias(
    moduleRecord: AliasModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { name: specifier, path: modulePath } = moduleRecord;
    const entry = path.resolve(opts.rootDir, modulePath);
    if (fs.existsSync(entry)) {
        return {
            entry,
            specifier,
            scope: opts.scopeDir || opts.rootDir,
            version: opts.version,
        };
    }
}

function resolveModulesFromList(
    modules: ModuleRecord[],
    opts: InnerResolverOptions
): RegistryEntry[] {
    const resolvedModules: RegistryEntry[] = [];

    modules.forEach(moduleRecord => {
        validateModuleRecord(moduleRecord);

        if (isDirModuleRecord(moduleRecord)) {
            resolvedModules.push(...resolveModulesFromDir(moduleRecord.dir, opts));
        } else if (!opts.skipRecursiveNpm && isNpmModuleRecord(moduleRecord)) {
            resolvedModules.push(...resolveModulesFromNpm(moduleRecord, opts));
        } else if (isAliasModuleRecord(moduleRecord)) {
            const aliasRecord = resolveModulesFromAlias(moduleRecord, opts);
            if (aliasRecord) {
                resolvedModules.push(aliasRecord);
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
    const configPath = findFirstUpwardConfigPath(rootDir);

    if (!configPath) {
        throw new Error(`Unable to find a configurations to start the resolution`);
    }

    const { version } = loadPackageJson(configPath);
    const lwcConfig = normalizeConfig({ ...getLwcConfig(configPath), rootDir: configPath });
    const mergedModules = mergeModules(modules, lwcConfig.modules);
    return resolveModulesFromList(mergedModules, {
        rootDir,
        scopeDir: rootDir,
        skipExposeFilter: true,
        version,
    });
}

export function resolveModule(
    importee: string,
    importer: string,
    ignoreCache = false
): RegistryEntry | undefined {
    if (
        !importer ||
        importee.startsWith('.') ||
        importee.startsWith('/') ||
        !fs.existsSync(importer)
    ) {
        return;
    }

    const configPath = findFirstUpwardConfigPath(path.resolve(importer));

    if (!configPath) {
        throw new Error(`Unable to find an LWC configuration to resolve ${importee} from ${importer}`);
    }
    const lwcConfig = getLwcConfig(configPath, ignoreCache);
    const modules = lwcConfig && lwcConfig.modules;

    if (modules && modules.length) {
        let resolvedRecord: RegistryEntry | undefined;
        const { version } = loadPackageJson(configPath);

        modules.some(moduleRecord => {
            validateModuleRecord(moduleRecord);
            const opts = { rootDir: configPath, scopeDir: configPath, version };
            if (isAliasModuleRecord(moduleRecord)) {
                resolvedRecord = resolveModulesFromAlias(moduleRecord, opts);
            } else if (isDirModuleRecord(moduleRecord)) {
                const modulesFromDir = resolveModulesFromDir(moduleRecord.dir, opts);
                resolvedRecord = modulesFromDir.find(m => m.specifier === importee);
            } else if (isNpmModuleRecord(moduleRecord)) {
                const modulesFromNpm = resolveModulesFromNpm(moduleRecord, {
                    ...opts,
                    skipRecursiveNpm: true,
                });
                resolvedRecord = modulesFromNpm.find(m => m.specifier === importee);
            }

            return !!resolvedRecord;
        });

        return resolvedRecord;
    }
}

export { isDirModuleRecord, isNpmModuleRecord, isAliasModuleRecord, validateModuleRecord };
