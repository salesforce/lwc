// @ts-check

import path from 'node:path';
import { defineConfig, configDefaults } from 'vitest/config';

import plugins from './vitest-plugins';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
    plugins: plugins('test'),
    test: {
        name: 'lwc-karma:test',
        dir: 'test',
        include: ['**/*.spec.{js,ts}'],
        exclude: [...configDefaults.exclude, '**/__screenshots__/**'],
        globals: true,
        passWithNoTests: true,
        silent: true,
        setupFiles: ['./vitest-setup/index.ts'],
        env: {
            NODE_ENV: 'development',
            NATIVE_SHADOW: 'true',
            NODE_ENV_FOR_TEST: process.env.NODE_ENV_FOR_TEST,
            ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL:
                process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
            DISABLE_STATIC_CONTENT_OPTIMIZATION: process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION,
            API_VERSION: process.env.API_VERSION,
        },
        alias: [
            {
                find: 'test-utils',
                replacement: path.resolve(__dirname, 'vitest-helpers/test-utils.ts'),
            },
        ],
        browser: {
            enabled: true,
            headless: true,
            ui: false,
            screenshotFailures: false,
            name: 'chromium',
            provider: 'playwright',
            testerScripts: [
                {
                    src: '@lwc/engine-dom/dist/index.js?iife',
                },
            ],
            providerOptions: { launch: { devtools: true } },
        },
    },
});
