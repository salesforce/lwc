// @ts-check

import { defineConfig, configDefaults } from 'vitest/config';

import transformFramework from './vitest-scripts/karma-plugins/transform-framework';
import lwcTestPlugin from './vitest-scripts/karma-plugins/lwc';
export default defineConfig({
    plugins: [transformFramework(), lwcTestPlugin()],
    test: {
        name: 'lwc-integration-karma',
        dir: 'test',
        include: ['**/*.spec.{js,ts}'],
        exclude: [...configDefaults.exclude, '**/__screenshots__/**'],
        globals: true,
        passWithNoTests: true,
        setupFiles: ['./vitest-helpers/test-setup.ts'],
        env: {
            NODE_ENV: 'test-karma-lwc',
            NATIVE_SHADOW: 'true',
            ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL:
                process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
            DISABLE_STATIC_CONTENT_OPTIMIZATION: process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION,
        },
        browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            name: 'chromium',
            provider: 'playwright',
            testerScripts: [
                {
                    src: '@lwc/engine-dom/dist/index.js?iife',
                },
                process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL
                    ? {
                          src: '@lwc/aria-reflection/dist/index.js?iife',
                      }
                    : {},
            ],
            providerOptions: { launch: { devtools: true } },
        },
    },
});
