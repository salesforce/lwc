// @ts-check

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import createCustomRollupPlugin from './vitest-scripts/karma-plugins/lwc';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
    plugins: [
        {
            ...createCustomRollupPlugin({
                rootDir: 'test',
                include: ['**/*.{js,ts}'],
            }),
            enforce: 'pre',
            apply: 'build',
        },
    ],
    test: {
        name: 'lwc-integration-karma',
        include: ['test/**/*.spec.{js,ts}'],
        exclude: ['**/__screenshots__/**'],
        globals: true,
        alias: [
            {
                find: 'test-utils',
                replacement: path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
            },
            { find: /^x\/(.*)/, replacement: './x/$1/$1' },
        ],
        setupFiles: ['./vitest-helpers/test-setup.ts'],
        env: {
            NODE_ENV: 'test-karma-lwc',
            NATIVE_SHADOW: 'true',
        },
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            providerOptions: {},
        },
    },
});
