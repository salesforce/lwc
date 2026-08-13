/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Playwright config for testing the playground built in development mode.
 * Mirrors playwright.config.js but runs `build:dev` instead of `build`.
 */
import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT || 3001;

export default defineConfig({
    testDir: './tests/playwright',
    forbidOnly: !!process.env.CI,
    retries: 0,
    use: {
        baseURL: `http://localhost:${PORT}`,
        headless: !process.env.PWDEBUG,
    },
    webServer: {
        command: `yarn build:dev && yarn serve --listen ${PORT} --no-clipboard`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
