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
    moduleRecord: AliasModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry {
    const { name: specifier, path: modulePath } = moduleRecord;
    const entry = path.resolve(opts.rootDir, modulePath);
    if (!fs.existsSync(entry)) {
        throw new Error(
            `Unable to find AliasModuleRecord for "${specifier}". File ${entry} does not exist`
        );
    }

    return createRegistryEntry(entry, specifier, opts);
}

function resolveModuleFromDir(
    specifier: string,
    moduleRecord: DirModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { dir } = moduleRecord;
    const absModuleDir = path.isAbsolute(dir) ? dir : path.join(opts.rootDir, dir);
    const [ns, name] = specifier.split('/');

    if (ns && name) {
        const moduleDir = path.join(absModuleDir, ns, name);
        const entry = getModuleEntry(moduleDir, name);
        if (entry) {
            return createRegistryEntry(entry, specifier, opts);
        }
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
    const modules = lwcConfig && lwcConfig.modules;

    if (modules) {
        validateNpmConfig(lwcConfig);
        const exposedModules = lwcConfig.expose || [];
        if (exposedModules.includes(specifier)) {
            for (const moduleRecord of modules) {
                if (!isNpmModuleRecord(moduleRecord)) {
                    const registryEntry = resolveModuleRecordType(specifier, moduleRecord, {
                        rootDir: packageDir,
                    });
                    if (registryEntry) {
                        if (aliasMapping && aliasMapping[specifier]) {
                            registryEntry.specifier = aliasMapping[specifier];
                        }
                        return registryEntry;
                    }
                }
            }

            throw new Error(`Unable to find ${specifier} under package ${npmModuleRecord.npm}`);
        }
    }
}

function resolveModuleRecordType(
    specifier: string,
    moduleRecord: ModuleRecord,
    opts: InnerResolverOptions
): RegistryEntry | undefined {
    const { rootDir } = opts;
    validateModuleRecord(moduleRecord);

    if (isAliasModuleRecord(moduleRecord) && moduleRecord.name === specifier) {
        return resolveModuleFromAlias(moduleRecord, { rootDir });
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

    if (modules.length === 0) {
        throw new Error(`Unable to resolve ${importee}: No ModuleRecords have been defined`);
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
