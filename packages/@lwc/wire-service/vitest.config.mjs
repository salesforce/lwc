import { defineProject, mergeConfig } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-wire-service',
            environment: 'jsdom',
        },
    })
);
