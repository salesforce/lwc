import { defineConfig } from 'vitest/config';
import sharedConfig from '../../../vitest.shared.mjs';

export default defineConfig({
    ...sharedConfig,
    test: {
        ...sharedConfig.test,
        environment: 'jsdom',
        setupFiles: [],
    },
});
