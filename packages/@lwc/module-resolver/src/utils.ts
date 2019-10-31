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
    ModuleResolverConfig,
    ModuleRecord,
    AliasModuleRecord,
    NpmModuleRecord,
    DirModuleRecord,
} from '.';

export const LWC_CONFIG_FILE = 'lwc.config.json';

const DEFAULT_CONFIG: LwcConfig = { modules: [] };

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

export function loadConfig(configDir: string): LwcConfig {
    const configFile = path.join(configDir, LWC_CONFIG_FILE);
    if (!fs.existsSync(configFile)) {
        return DEFAULT_CONFIG;
    }

    try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {
        console.log(`[module-resolver] Error parsing JSON on file: "${configFile}"`);
        return DEFAULT_CONFIG;
    }
}

export function getEntry(moduleDir: string, moduleName: string, ext: string): string {
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

// User defined modules will have precedence over the ones defined elsewhere (ex. npm)
export function mergeModules(userModules: ModuleRecord[], configModules: ModuleRecord[]) {
    const visited = new Set();
    const modules = userModules.slice();

    // Visit the user modules to created an index with the name as keys
    userModules.forEach(m => {
        if (isAliasModuleRecord(m)) {
            visited.add(m.name);
        }
    });

    configModules.forEach(m => {
        // Collect all of the modules unless they been already defined in userland
        if (!isAliasModuleRecord(m) || !visited.has(m.name)) {
            modules.push(m);
        }
    });

    return modules;
}
