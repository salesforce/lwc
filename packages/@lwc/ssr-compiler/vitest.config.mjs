import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    baseConfig,
    defineProject({
        test: {
            runner: './src/__tests__/utils/runner.ts',
            name: 'lwc-ssr-compiler',
        },
    })
);
