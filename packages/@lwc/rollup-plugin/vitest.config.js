import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.shared';

export default mergeConfig(
    baseConfig,
    defineProject({
        test: {
            name: 'rollup-plugin-lwc-compiler',
            alias: {
                '@lwc/shared': '@lwc/shared/src',
            },
        },
    })
);
