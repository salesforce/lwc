// @ts-check

import { defineConfig } from 'vitest/config';
import createCustomRollupPlugin from './vitest-scripts/karma-plugins/lwc';

export default defineConfig({
    plugins: [
        {
            ...createCustomRollupPlugin({ rootDir: 'test/api', include: ['**/*.spec.js'] }),
            enforce: 'pre',
            apply: 'build',
        },
    ],
    test: {
        name: 'lwc-integration-karma',
        include: ['test/api/**/*.spec.js'],
        globals: true,
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            providerOptions: {},
        },
    },
});
