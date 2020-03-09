/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { LwcConfig, ModuleResolverConfig, ModuleRecord, ModuleRecordObject } from '.';

export const LWC_CONFIG_FILE = 'lwc.config.json';

const DEFAULT_CONFIG: LwcConfig = { modules: [] };

export function isString(str: any): boolean {
    return Object.prototype.toString.call(str) === '[object String]';
}

export function loadConfig(configPath: string): LwcConfig {
    const configFile = path.join(configPath, LWC_CONFIG_FILE);
    if (!fs.existsSync(configFile)) {
        return DEFAULT_CONFIG;
    }

    try {
        return JSON.parse(fs.readFileSync(path.join(configPath, LWC_CONFIG_FILE), 'utf8'));
    } catch (e) {
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

// The modules can be either string or ModuleRecordObject { name, path }
//
// user define modules will have precedence over the ones defined elsewhere (ex. npm)
export function mergeModules(userModules: ModuleRecord[], configModules: ModuleRecord[]) {
    const visited = new Set();
    const modules = userModules;

    // Visit the user modules to created an index with the name as keys
    userModules.forEach(m => {
        visited.add(isString(m) ? m : (m as ModuleRecordObject).name);
    });

    configModules.forEach(m => {
        // Collect all of the modules unless they been already defined in userland
        if (isString(m) || !visited.has((m as ModuleRecordObject).name)) {
            modules.push(m);
        }
    });

    return modules;
}
