import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    baseConfig,
    defineProject({
        test: {
            name: 'lwc-compiler',
            // Workaround to fix `const enum`, which is required because we use e.g. `APIFeature` from `@lwc/shared`
            // See https://github.com/vitest-dev/vitest/discussions/3964
            alias: {
                '@lwc/shared': '@lwc/shared/src',
            },
        },
    })
);
