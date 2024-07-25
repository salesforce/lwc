import { defineProject, mergeConfig } from 'vitest/config';
import sharedConfig from '../../../vitest.shared';

export default mergeConfig(
    sharedConfig,
    defineProject({
        test: {
            name: 'lwc-wire-service',
            environment: 'jsdom',
        },
    })
);
