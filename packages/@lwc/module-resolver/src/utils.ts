import fs from 'fs';
import path from 'path';
import { LwcConfig, ModuleResolverConfig, ModuleRecord, ModuleRecordObject } from '.';

export const LWC_CONFIG_FILE = 'lwc.config.json';

const DEFAULT_CONFIG: LwcConfig = { modules: [] };

export function isString(str) {
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

export function getEntry(moduleDir, moduleName, ext) {
    return path.join(moduleDir, `${moduleName}.${ext}`);
}

export function getModuleEntry(moduleDir, moduleName) {
    const entryJS = getEntry(moduleDir, moduleName, 'js');
    const entryHTML = getEntry(moduleDir, moduleName, 'html');
    const entryCSS = getEntry(moduleDir, moduleName, 'css');

    if (fs.existsSync(entryJS)) {
        return entryJS;
    } else if (fs.existsSync(entryHTML)) {
        return entryHTML;
    } else if (fs.existsSync(entryCSS)) {
        return entryCSS;
    }
}

export function normalizeConfig(config: Partial<ModuleResolverConfig>): ModuleResolverConfig {
    const rootDir = config.rootDir ? path.resolve(config.rootDir) : process.cwd();
    return {
        ...DEFAULT_CONFIG,
        modules: config.modules || [],
        rootDir,
    };
}

// userModules will always win other resolved modules
export function mergeModules(userModules: ModuleRecord[], configModules: ModuleRecord[]) {
    const visited = new Set();
    const modules = userModules;

    // visit the user modules to created an index of module names
    userModules.forEach(m => {
        visited.add(isString(m) ? m : (m as ModuleRecordObject).name);
    });

    configModules.forEach(m => {
        // Collect all of the modules that are not defined already by the user
        if (isString(m) || !visited.has((m as ModuleRecordObject).name)) {
            modules.push(m);
        }
    });

    return modules;
}
