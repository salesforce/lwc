export interface RegistryEntry {
    entry: string;
    specifier: string;
    scope: string;
    version?: string;
}

export interface AliasModuleRecord {
    name: string;
    path: string;
}

export interface DirModuleRecord {
    dir: string;
}

export interface NpmModuleRecord {
    npm: string;
    map?: {
        [key: string]: string;
    };
}

export interface ModuleResolverConfig {
    rootDir: string;
    modules: ModuleRecord[];
}

export type ModuleRecord = AliasModuleRecord | DirModuleRecord | NpmModuleRecord;
export interface LwcConfig {
    modules?: ModuleRecord[];
    expose?: string[];
}

export interface InnerResolverOptions {
    rootDir: string;
    scopeDir: string;
    skipRecursiveNpm?: boolean;
    skipExposeFilter?: boolean;
    version?: string;
}
