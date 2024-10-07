// @ts-check

import { defineConfig } from 'vitest/config';
import lwcTestPlugin from './vitest-scripts/karma-plugins/lwc';

export default defineConfig({
    plugins: [lwcTestPlugin()],
    test: {
        name: 'lwc-integration-karma',
        dir: 'test',
        include: ['**/*.spec.{js,ts}'],
        exclude: ['**/__screenshots__/**'],
        globals: true,
        passWithNoTests: true,
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
            testerScripts: [{}],
            providerOptions: { launch: { devtools: true } },
        },
    },
});
