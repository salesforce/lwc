import typescript from '@rollup/plugin-typescript';
import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-template-compiler',
        },
        plugins: [
            // Workaround to fix `const enum`, which is required because we use e.g. `APIFeature` from `@lwc/shared`
            // See https://github.com/vitest-dev/vitest/discussions/3964
            typescript({
                noEmitOnError: true,
            }),
        ],
    })
);
