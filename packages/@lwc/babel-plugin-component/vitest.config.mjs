import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';
import pkg from './package.json';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'babel-plugin-component',
            // Workaround to fix `const enum`, which is required because we use e.g. `APIFeature` from `@lwc/shared`
            // See https://github.com/vitest-dev/vitest/discussions/3964
            // Using `src` also ensures that the test coverage is accurately reported
            alias: Object.fromEntries(
                Object.keys(pkg.dependencies ?? {})
                    .filter((_) => _.startsWith('@lwc/'))
                    .map((dep) => [dep, `${dep}/src`])
            ),
        },
    })
);
