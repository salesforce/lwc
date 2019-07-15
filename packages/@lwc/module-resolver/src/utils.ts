import fs from 'fs';
import path from 'path';
import { LwcConfig, ModuleResolverConfig, ModuleId } from '.';

const DEFAULT_CONFIG: LwcConfig = {
    modules: [],
};

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

export function mergeModules(userModules: ModuleId[], configModules: ModuleId[]) {
    return Array.from(new Set(userModules.concat(configModules)));
}

export const LWC_CONFIG_FILE = 'lwc.config.json';
