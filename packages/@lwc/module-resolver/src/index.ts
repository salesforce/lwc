/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import path from 'path';
import fs from 'fs';

import {
    createRegistryEntry,
    findFirstUpwardConfigPath,
    validateModuleRecord,
    isAliasModuleRecord,
    isDirModuleRecord,
    isNpmModuleRecord,
    getLwcConfig,
    getModuleEntry,
    normalizeConfig,
    validateNpmConfig,
    mergeModules,
    remapList,
    transposeObject,
    validateNpmAlias,
} from './utils';
import { NoLwcModuleFound, LwcConfigError } from './errors';

import {
    RegistryEntry,
    AliasModuleRecord,
    InnerResolverOptions,
    ModuleRecord,
    DirModuleRecord,
    ModuleResolverConfig,
    NpmModuleRecord,
} from './types';

function resolveModuleFromAlias(
    specifier: string,
    moduleRecord: AliasModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { name, path: modulePath } = moduleRecord;
    if (specifier === name) {
        const entry = path.resolve(opts.rootDir, modulePath);
        if (!fs.existsSync(entry)) {
            throw new LwcConfigError(
                `Invalid npm module record "${JSON.stringify(
                    moduleRecord
                )}", file ${entry} does not exist`,
                { scope: opts.rootDir }
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
        const entry = getModuleEntry(moduleDir, name, opts);
        return createRegistryEntry(entry, specifier, opts);
    }
}

function resolveModuleFromNpm(
    specifier: string,
    npmModuleRecord: NpmModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { npm, map: aliasMapping } = npmModuleRecord;

    let pkgJsonPath;
    try {
        pkgJsonPath = require.resolve(`${npm}/package.json`, { paths: [opts.rootDir] });
    } catch (error) {
        // If the module "package.json" can't be found, throw an an invalid config error. Otherwise
        // rethrow the original error.
        if (error.code === 'MODULE_NOT_FOUND') {
            throw new LwcConfigError(
                `Invalid npm module record "${JSON.stringify(
                    npmModuleRecord
                )}", "${npm}" npm module can't be resolved`,
                { scope: opts.rootDir }
            );
        }

        throw error;
    }

    const packageDir = path.dirname(pkgJsonPath);
    const lwcConfig = getLwcConfig(packageDir);

    validateNpmConfig(lwcConfig, { rootDir: packageDir });
    let exposedModules = lwcConfig.expose;
    let reverseMapping;

    if (aliasMapping) {
        validateNpmAlias(lwcConfig.expose, aliasMapping, { rootDir: packageDir });
        exposedModules = remapList(lwcConfig.expose, aliasMapping);
        reverseMapping = transposeObject(aliasMapping);
    }

    if (exposedModules.includes(specifier)) {
        for (const moduleRecord of lwcConfig.modules) {
            const aliasedSpecifier = reverseMapping && reverseMapping[specifier];
            const registryEntry = resolveModuleRecordType(
                aliasedSpecifier || specifier,
                moduleRecord,
                {
                    rootDir: packageDir,
                }
            );

            if (registryEntry) {
                if (aliasedSpecifier) {
                    registryEntry.specifier = specifier;
                }
                return registryEntry;
            }
        }

        throw new LwcConfigError(
            `Unable to find "${specifier}" under package "${npmModuleRecord.npm}"`,
            {
                scope: opts.rootDir,
            }
        );
    }
}

function resolveModuleRecordType(
    specifier: string,
    moduleRecord: ModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { rootDir } = opts;

    if (isAliasModuleRecord(moduleRecord)) {
        return resolveModuleFromAlias(specifier, moduleRecord, { rootDir });
    } else if (isDirModuleRecord(moduleRecord)) {
        return resolveModuleFromDir(specifier, moduleRecord, { rootDir });
    } else if (isNpmModuleRecord(moduleRecord)) {
        return resolveModuleFromNpm(specifier, moduleRecord, opts);
    }

    throw new LwcConfigError(`Unknown module record "${JSON.stringify(moduleRecord)}"`, {
        scope: rootDir,
    });
}

export function resolveModule(
    importee: string,
    importer: string,
    config?: Partial<ModuleResolverConfig>
): RegistryEntry {
    if (typeof importee !== 'string') {
        throw new TypeError(
            `The importee argument must be a string. Received type ${typeof importee}`
        );
    }

    if (typeof importer !== 'string') {
        throw new TypeError(
            `The importer argument must be a string. Received type ${typeof importer}`
        );
    }

    if (importee.startsWith('.') || importee.startsWith('/')) {
        throw new TypeError(
            `The importee argument must be a valid LWC module name. Received "${importee}"`
        );
    }

    const rootDir = findFirstUpwardConfigPath(path.resolve(importer));
    const lwcConfig = getLwcConfig(rootDir);

    let modules = lwcConfig.modules || [];
    if (config) {
        const userConfig = normalizeConfig(config);
        modules = mergeModules(userConfig.modules, modules);
    }

    for (const moduleRecord of modules) {
        validateModuleRecord(moduleRecord, { rootDir });
        const registryEntry = resolveModuleRecordType(importee, moduleRecord, { rootDir });
        if (registryEntry) {
            return registryEntry;
        }
    }

    throw new NoLwcModuleFound(importee, importer);
}

export { isDirModuleRecord, isNpmModuleRecord, isAliasModuleRecord, validateModuleRecord };
