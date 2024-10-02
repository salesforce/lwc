// @ts-check

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import lwcTestPlugin from './vitest-scripts/karma-plugins/lwc';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig((_env) => {
    const dir = 'test';
    // const basePath = path.resolve(__dirname, dir)

    return {
        plugins: [
            lwcTestPlugin({
                dir,
            }),
        ],
        test: {
            name: 'lwc-integration-karma',
            dir,
            include: ['**/*.spec.{js,ts}'],
            exclude: ['**/__screenshots__/**'],
            globals: true,
            alias: [
                {
                    find: 'test-utils',
                    replacement: path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
                },
            ],
            setupFiles: ['./vitest-helpers/test-setup.ts'],
            env: {
                NODE_ENV: 'test-karma-lwc',
                NATIVE_SHADOW: 'true',
            },
            browser: {
                enabled: true,
                headless: true,
                name: 'chromium',
                provider: 'playwright',
                providerOptions: {},
            },
        },
    };
});
