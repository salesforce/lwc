import path from 'node:path';
// import { suite, test, type TestFunction } from 'vitest';

export interface FixturesModule<T, C> {
    files: Record<string, T>;
    configs: Record<string, C>;
}

export interface FixtureContext<T, C> {
    file: T;
    config: C;
    dirname: string;
    basename: string;
}

export function getFixtures<T, C>(module: FixturesModule<T, C>): FixtureContext<T, C>[] {
    return Object.entries(module.files).map(([filename, file]) => {
        const dirname = path.dirname(filename);
        const basename = path.basename(dirname);
        const config = module.configs[`${dirname}/config.json`];
        return {
            file,
            dirname,
            basename,
            config,
        };
    });
}
