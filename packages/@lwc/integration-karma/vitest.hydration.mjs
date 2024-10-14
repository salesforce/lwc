// @ts-check

import path from 'node:path';
import { defineConfig } from 'vitest/config';
import lwcHydrationTestPlugin from './vitest-plugins/hydration-tests';
import configPlugin from './vitest-plugins/config';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
    plugins: [configPlugin(), lwcHydrationTestPlugin()],
    test: {
        name: 'lwc-karma:test-hydration',
        dir: 'test-hydration',
        include: ['**/*.spec.js'],
        exclude: ['**/__screenshots__/**'],
        globals: true,
        silent: true,
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
        setupFiles: ['./vitest-setup/index.ts'],
        env: {
            NODE_ENV: 'test-karma-lwc',
            ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
            DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE:
                process.env.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
        },
        isolate: false,
        browser: {
            enabled: true,
            isolate: false,
            headless: true,
            screenshotFailures: false,
            ui: false,
            name: 'chromium',
            provider: 'playwright',
            providerOptions: { launch: { devtools: true } },
        },
    },
});
