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
                include: ['**/*.js', '**/*.ts'],
                modules: [
                    {
                        name: 'x/publicProperties',
                        path: 'test/api/getComponentDef/x/publicProperties/publicProperties.js',
                    },
                ],
            }),
            enforce: 'pre',
            apply: 'build',
        },
    ],
    test: {
        name: 'lwc-integration-karma',
        include: ['test/**/*.spec.{js,ts}'],
        globals: true,
        alias: {
            'test-utils': path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
        },
        setupFiles: ['./vitest-helpers/test-setup.ts', './vitest-helpers/test-matchers.ts'],
        env: {
            NODE_ENV: 'test-karma-lwc',
        },
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            providerOptions: {},
        },
    },
});
