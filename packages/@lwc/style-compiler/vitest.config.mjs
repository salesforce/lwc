import { mergeConfig, defineProject } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-style-compiler',
        },
    })
);
