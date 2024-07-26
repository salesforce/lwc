import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    baseConfig,
    defineProject({
        test: {
            name: 'lwc-module-resolver',
            setupFiles: ['./scripts/test/setup-test.ts'],
        },
    })
);
