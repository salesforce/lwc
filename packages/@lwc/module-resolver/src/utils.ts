/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import {
    LwcConfig,
    ModuleRecord,
    NpmModuleRecord,
    DirModuleRecord,
    AliasModuleRecord,
    ModuleResolverConfig,
} from './types';

const PACKAGE_JSON = 'package.json';
const DEFAULT_CONFIG: LwcConfig = { modules: [] };
const LWC_CONFIG_FILE = 'lwc.config.json';

export function isString(str: any): boolean {
    return Object.prototype.toString.call(str) === '[object String]';
}

export function validateModuleRecord(moduleRecord: ModuleRecord) {
    if (isString(moduleRecord)) {
        throw new Error(`Found a string module record (${moduleRecord}). It must be an object`);
    }
}

export function isNpmModuleRecord(moduleRecord: ModuleRecord): moduleRecord is NpmModuleRecord {
    return (moduleRecord as NpmModuleRecord).npm !== undefined;
}

export function isDirModuleRecord(moduleRecord: ModuleRecord): moduleRecord is DirModuleRecord {
    return (moduleRecord as DirModuleRecord).dir !== undefined;
}

export function isAliasModuleRecord(moduleRecord: ModuleRecord): moduleRecord is AliasModuleRecord {
    return (moduleRecord as AliasModuleRecord).name !== undefined;
}

export function existsLwcConfig(configDir: string) {
    return fs.existsSync(path.join(configDir, LWC_CONFIG_FILE));
}

export function loadLwcConfig(configDir: string): LwcConfig {
    const configFile = path.join(configDir, LWC_CONFIG_FILE);
    if (!fs.existsSync(configFile)) {
        return DEFAULT_CONFIG;
    }

    try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
            `[module-resolver] Error parsing JSON on file: "${configFile}", ignoring config file.`
        );
        return DEFAULT_CONFIG;
    }
}

export function loadPackageJson(pkgDir: string): any {
    const pkgFile = path.join(pkgDir, PACKAGE_JSON);
    try {
        return JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`[module-resolver] Error parsing package.json on dir: "${pkgDir}"`);
        return {};
    }
}

export function getEntry(moduleDir, moduleName, ext) {
    return path.join(moduleDir, `${moduleName}.${ext}`);
}

export function getModuleEntry(moduleDir: string, moduleName: string): string | undefined {
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
}

export function normalizeConfig(config: Partial<ModuleResolverConfig>): ModuleResolverConfig {
    const rootDir = config.rootDir ? path.resolve(config.rootDir) : process.cwd();
    const modules = config.modules || [];
    return {
        ...DEFAULT_CONFIG,
        modules,
        rootDir,
    };
}

function normalizeDirName(dirName: string) {
    return dirName.endsWith('/') ? dirName : `${dirName}/`;
}

// User defined modules will have precedence over the ones defined elsewhere (ex. npm)
export function mergeModules(userModules: ModuleRecord[], configModules: ModuleRecord[] = []) {
    const visitedAlias = new Set();
    const visitedDirs = new Set();
    const visitedNpm = new Set();
    const modules = userModules.slice();

    // Visit the user modules to created an index with the name as keys
    userModules.forEach(m => {
        if (isAliasModuleRecord(m)) {
            visitedAlias.add(m.name);
        } else if (isDirModuleRecord(m)) {
            visitedDirs.add(normalizeDirName(m.dir));
        } else if (isNpmModuleRecord(m)) {
            visitedNpm.add(m.npm);
        }
    });

    configModules.forEach(m => {
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

export function findFirstUpwardConfigPath(currentPath: string) {
    if (fs.lstatSync(currentPath).isFile()) {
        currentPath = path.dirname(currentPath);
    }

    const parts = currentPath.split(path.sep);

    while (parts.length > 1) {
        const upwardsPath = parts.join(path.sep);
        const pkgJsonPath = path.join(upwardsPath, PACKAGE_JSON);
        const configJsonPath = path.join(upwardsPath, LWC_CONFIG_FILE);

        const dirHasPkgJson = fs.existsSync(pkgJsonPath);
        const dirHasLwcConfig = fs.existsSync(configJsonPath);

        if (dirHasLwcConfig && !dirHasPkgJson) {
            throw new Error(
                'LWC config must be at the package root level (at the same package.json level)'
            );
        }

        if (dirHasPkgJson) {
            return path.dirname(pkgJsonPath);
        }

        parts.pop();
    }
}

const LWC_CONFIG_CACHE: Map<string, LwcConfig> = new Map();

export function validateNpmConfig(config: LwcConfig) {
    if (config.modules && !config.expose) {
        throw new Error(
            'Missing "expose" attribute: An imported npm package must explicitly define all the modules that it contains.'
        );
    }
}

export function getLwcConfig(dirPath: string, ignoreCache = false): LwcConfig | undefined {
    const useCache = !ignoreCache;
    if (useCache && LWC_CONFIG_CACHE.has(dirPath)) {
        return LWC_CONFIG_CACHE.get(dirPath);
    }

    const lwcConfig = existsLwcConfig(dirPath)
        ? loadLwcConfig(dirPath)
        : loadPackageJson(dirPath).lwc;

    if (lwcConfig && useCache) {
        LWC_CONFIG_CACHE.set(dirPath, lwcConfig);
    }

    return lwcConfig;
}
