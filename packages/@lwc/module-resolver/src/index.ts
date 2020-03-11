/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import fs from 'fs';
import {
    RegistryEntry,
    AliasModuleRecord,
    InnerResolverOptions,
    ModuleRecord,
    DirModuleRecord,
    ModuleResolverConfig,
    NpmModuleRecord,
} from './types';
import {
    createRegistryEntry,
    findFirstUpwardConfigPath,
    validateModuleRecord,
    isAliasModuleRecord,
    isDirModuleRecord,
    isNpmModuleRecord,
    validateImportee,
    getLwcConfig,
    getModuleEntry,
    normalizeConfig,
    validateNpmConfig,
    mergeModules,
} from './utils';

function resolveModuleFromAlias(
    specifier: string,
    moduleRecord: AliasModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { name, path: modulePath } = moduleRecord;
    if (specifier === name) {
        const entry = path.resolve(opts.rootDir, modulePath);
        if (!fs.existsSync(entry)) {
            throw new Error(
                `Unable to find AliasModuleRecord for "${specifier}". File ${entry} does not exist`
            );
        }

        return createRegistryEntry(entry, specifier, opts);
    }
}

function resolveModuleFromDir(
    specifier: string,
    moduleRecord: DirModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { dir } = moduleRecord;
    const absModuleDir = path.isAbsolute(dir) ? dir : path.join(opts.rootDir, dir);
    const parts = specifier.split('/');

    if (parts.length !== 2) {
        // We skip resolution but can't throw since other ModuleEntry types might come after
        return;
    }

    const [ns, name] = parts;
    const moduleDir = path.join(absModuleDir, ns, name);

    // If the module dir does not exist, we skip the resolution but dont throw since it can be resolved later
    if (fs.existsSync(moduleDir)) {
        const entry = getModuleEntry(moduleDir, name);
        return createRegistryEntry(entry, specifier, opts);
    }
}

function resolveModuleFromNpm(
    specifier: string,
    npmModuleRecord: NpmModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { npm, map: aliasMapping } = npmModuleRecord;
    const pkgJsonPath = require.resolve(`${npm}/package.json`, { paths: [opts.rootDir] });
    const packageDir = path.dirname(pkgJsonPath);
    const lwcConfig = getLwcConfig(packageDir);
    const hasAliasMapping = aliasMapping && aliasMapping[specifier];

    validateNpmConfig(lwcConfig);

    if (lwcConfig.expose.includes(specifier) || hasAliasMapping) {
        for (const moduleRecord of lwcConfig.modules) {
            const registryEntry = resolveModuleRecordType(
                aliasMapping && aliasMapping[specifier] ? aliasMapping[specifier] : specifier,
                moduleRecord,
                {
                    rootDir: packageDir,
                }
            );
            if (registryEntry) {
                if (aliasMapping && aliasMapping[specifier]) {
                    registryEntry.specifier = aliasMapping[specifier];
                }
                return registryEntry;
            }
        }

        throw new Error(`Unable to find ${specifier} under package ${npmModuleRecord.npm}`);
    }
}

function resolveModuleRecordType(
    specifier: string,
    moduleRecord: ModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { rootDir } = opts;
    validateModuleRecord(moduleRecord);

    if (isAliasModuleRecord(moduleRecord)) {
        return resolveModuleFromAlias(specifier, moduleRecord, { rootDir });
    } else if (isDirModuleRecord(moduleRecord)) {
        return resolveModuleFromDir(specifier, moduleRecord, { rootDir });
    } else if (isNpmModuleRecord(moduleRecord)) {
        return resolveModuleFromNpm(specifier, moduleRecord, opts);
    } else {
        throw new Error(`Invalid moduleRecord type ${moduleRecord}`);
    }
}

export function resolveModule(
    importee: string,
    importer: string,
    config?: Partial<ModuleResolverConfig>
): RegistryEntry {
    validateImportee(importee);

    const rootDir = findFirstUpwardConfigPath(path.resolve(importer));
    const lwcConfig = getLwcConfig(rootDir);
    let modules: ModuleRecord[] = lwcConfig.modules || [];

    if (config) {
        const userConfig = normalizeConfig(config);
        modules = mergeModules(userConfig.modules, modules);
    }

    for (const moduleRecord of modules) {
        const registryEntry = resolveModuleRecordType(importee, moduleRecord, { rootDir });
        if (registryEntry) {
            return registryEntry;
        }
    }

    throw new Error(`Unable to resolve ${importee} from ${importer}`);
}

export { isDirModuleRecord, isNpmModuleRecord, isAliasModuleRecord, validateModuleRecord };
