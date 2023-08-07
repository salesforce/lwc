/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import fs from 'fs';

import { LwcConfigError } from './errors';
import {
    LwcConfig,
    ModuleRecord,
    NpmModuleRecord,
    DirModuleRecord,
    AliasModuleRecord,
    ModuleResolverConfig,
    RegistryEntry,
    InnerResolverOptions,
    RegistryType,
} from './types';
import { isObject } from './shared';

const PACKAGE_JSON = 'package.json';
const LWC_CONFIG_FILE = 'lwc.config.json';

export function isNpmModuleRecord(moduleRecord: ModuleRecord): moduleRecord is NpmModuleRecord {
    return 'npm' in moduleRecord;
}

export function isDirModuleRecord(moduleRecord: ModuleRecord): moduleRecord is DirModuleRecord {
    return 'dir' in moduleRecord;
}

export function isAliasModuleRecord(moduleRecord: ModuleRecord): moduleRecord is AliasModuleRecord {
    return 'name' in moduleRecord && 'path' in moduleRecord;
}

function getEntry(moduleDir: string, moduleName: string, ext: string): string {
    return path.join(moduleDir, `${moduleName}.${ext}`);
}

export function getModuleEntry(
    moduleDir: string,
    moduleName: string,
    opts: InnerResolverOptions
): string {
    const entryJS = getEntry(moduleDir, moduleName, 'js');
    const entryTS = getEntry(moduleDir, moduleName, 'ts');
    const entryHTML = getEntry(moduleDir, moduleName, 'html');
    const entryCSS = getEntry(moduleDir, moduleName, 'css');

    // Order is important
    if (fs.existsSync(entryJS)) {
        return entryJS;
    } else if (fs.existsSync(entryTS)) {
        return entryTS;
    } else if (fs.existsSync(entryHTML)) {
        return entryHTML;
    } else if (fs.existsSync(entryCSS)) {
        return entryCSS;
    }

    throw new LwcConfigError(
        `Unable to find a valid entry point for "${moduleDir}/${moduleName}"`,
        { scope: opts.rootDir }
    );
}

export function normalizeConfig(
    config: Partial<ModuleResolverConfig>,
    scope: string
): ModuleResolverConfig {
    const rootDir = config.rootDir ? path.resolve(config.rootDir) : process.cwd();
    const modules = config.modules || [];
    const normalizedModules = modules.map((m) => {
        if (!isObject(m)) {
            throw new LwcConfigError(
                `Invalid module record. Module record must be an object, instead got ${JSON.stringify(
                    m
                )}.`,
                { scope }
            );
        }
        return isDirModuleRecord(m) ? { ...m, dir: path.resolve(rootDir, m.dir) } : m;
    });

    return {
        modules: normalizedModules,
        rootDir,
    };
}

function normalizeDirName(dirName: string): string {
    return dirName.endsWith('/') ? dirName : `${dirName}/`;
}

// User defined modules will have precedence over the ones defined elsewhere (ex. npm)
export function mergeModules(
    userModules: ModuleRecord[],
    configModules: ModuleRecord[] = []
): ModuleRecord[] {
    const visitedAlias = new Set();
    const visitedDirs = new Set();
    const visitedNpm = new Set();
    const modules = userModules.slice();

    // Visit the user modules to created an index with the name as keys
    userModules.forEach((m) => {
        if (isAliasModuleRecord(m)) {
            visitedAlias.add(m.name);
        } else if (isDirModuleRecord(m)) {
            visitedDirs.add(normalizeDirName(m.dir));
        } else if (isNpmModuleRecord(m)) {
            visitedNpm.add(m.npm);
        }
    });

    configModules.forEach((m) => {
        if (
            (isAliasModuleRecord(m) && !visitedAlias.has(m.name)) ||
            (isDirModuleRecord(m) && !visitedDirs.has(normalizeDirName(m.dir))) ||
            (isNpmModuleRecord(m) && !visitedNpm.has(m.npm))
        ) {
            modules.push(m);
        }
    });

    return modules;
}

export function findFirstUpwardConfigPath(dirname: string): string {
    const parts = dirname.split(path.sep);

    while (parts.length > 1) {
        const upwardsPath = parts.join(path.sep);
        const pkgJsonPath = path.join(upwardsPath, PACKAGE_JSON);
        const configJsonPath = path.join(upwardsPath, LWC_CONFIG_FILE);

        const dirHasPkgJson = fs.existsSync(pkgJsonPath);
        const dirHasLwcConfig = fs.existsSync(configJsonPath);

        if (dirHasLwcConfig && !dirHasPkgJson) {
            throw new LwcConfigError(
                `"lwc.config.json" must be at the package root level along with the "package.json"`,
                { scope: upwardsPath }
            );
        }

        if (dirHasPkgJson) {
            return path.dirname(pkgJsonPath);
        }

        parts.pop();
    }

    throw new LwcConfigError(`Unable to find any LWC configuration file`, { scope: dirname });
}

export function validateNpmConfig(
    config: LwcConfig,
    opts: InnerResolverOptions
): asserts config is Required<LwcConfig> {
    if (!config.modules) {
        throw new LwcConfigError('Missing "modules" property for a npm config', {
            scope: opts.rootDir,
        });
    }

    if (!config.expose) {
        throw new LwcConfigError(
            'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains',
            { scope: opts.rootDir }
        );
    }
}

export function validateNpmAlias(
    exposed: string[],
    map: { [key: string]: string },
    opts: InnerResolverOptions
) {
    Object.keys(map).forEach((specifier) => {
        if (!exposed.includes(specifier)) {
            throw new LwcConfigError(
                `Unable to apply mapping: The specifier "${specifier}" is not exposed by the npm module`,
                { scope: opts.rootDir }
            );
        }
    });
}

export function getLwcConfig(dirname: string): LwcConfig {
    const packageJsonPath = path.resolve(dirname, PACKAGE_JSON);
    const lwcConfigPath = path.resolve(dirname, LWC_CONFIG_FILE);

    if (fs.existsSync(lwcConfigPath)) {
        return require(lwcConfigPath);
    } else {
        return require(packageJsonPath).lwc ?? {};
    }
}

export function createRegistryEntry(
    entry: string,
    specifier: string,
    type: RegistryType,
    opts: InnerResolverOptions
): RegistryEntry {
    return {
        entry,
        specifier,
        type,
        scope: opts.rootDir,
    };
}

export function remapList(exposed: string[], map: { [key: string]: string }): string[] {
    return exposed.reduce((renamed: string[], item) => {
        renamed.push(map[item] || item);
        return renamed;
    }, []);
}

export function transposeObject(map: { [key: string]: string }): { [key: string]: string } {
    return Object.entries(map).reduce(
        (r: { [key: string]: string }, [key, value]) => ((r[value] = key), r),
        {}
    );
}
