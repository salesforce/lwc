import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';
import pkg from './package.json';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-style-compiler',
            // To properly resolve `const enum`, we need to point to the TypeScript source files
            // See https://github.com/vitest-dev/vitest/discussions/3964
            // Using `src` also ensures that the test coverage is accurately reported
            alias: Object.fromEntries(
                Object.keys(pkg.dependencies ?? {})
                    .filter((dep) => dep.startsWith('@lwc/'))
                    .map((dep) => [dep, `${dep}/src`])
            ),
        },
    })
);
