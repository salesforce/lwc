import path from 'node:path';
import { suite, test, type TestFunction } from 'vitest';

export interface FixturesModule<T, C> {
    dirname: string;
    files: Record<string, T>;
    configs: Record<string, C>;
}

export interface FixtureContext<T, C> {
    file: T;
    config: C;
    dirname: string;
    basename: string;
}

export const describe = {
    fixtures<T, C>(module: FixturesModule<T, C>, fn: TestFunction<FixtureContext<T, C>>) {
        const root = path.resolve(import.meta.dirname, '../../');
        const relative = path.relative(root, module.dirname);
        const cases = Object.entries(module.files);
        suite(relative, () => {
            for (const [filename, file] of cases) {
                const dirname = path.dirname(filename);
                const basename = path.basename(dirname);
                const config = module.configs[`${dirname}/config.json`];
                test.concurrent(dirname, ({ expect, task, skip, onTestFailed, onTestFinished }) => {
                    fn({
                        task,
                        skip,
                        onTestFailed,
                        onTestFinished,
                        expect,
                        file,
                        config,
                        dirname,
                        basename,
                    });
                });
            }
        });
    },
} as const;
