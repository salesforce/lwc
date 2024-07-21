import { defineProject, mergeConfig } from 'vitest/config';
import baseConfig from '../../../vitest.shared';

export default mergeConfig(
    baseConfig,
    defineProject({
        test: {
            name: 'lwc-engine-core',
        },
    })
);
