// @ts-check

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import lwcHydrationTestPlugin from './vitest-scripts/karma-plugins/hydration-tests';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig((_env) => {
    // const basePath = path.resolve(__dirname, dir)

    return {
        plugins: [lwcHydrationTestPlugin()],
        test: {
            name: 'lwc-integration-karma',
            dir: 'test-hydration',
            include: ['**/*.spec.js'],
            exclude: ['**/__screenshots__/**'],
            globals: true,
            passWithNoTests: true,
            alias: [
                {
                    find: 'test-utils',
                    replacement: path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
                },
                {
                    find: 'test-hydrate',
                    replacement: path.resolve(__dirname, 'vitest-helpers/test-hydrate.ts'),
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
                screenshotFailures: false,
                name: 'chromium',
                provider: 'playwright',
                providerOptions: { launch: { devtools: true } },
            },
        },
    };
});
