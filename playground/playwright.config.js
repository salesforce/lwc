/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT || 3000;

export default defineConfig({
    testDir: './tests/playwright',
    // Fail fast in CI; keep going locally so developers see all failures
    forbidOnly: !!process.env.CI,
    // No retries – flakiness here means a real regression
    retries: 0,
    use: {
        baseURL: `http://localhost:${PORT}`,
        // Run headless in CI, headed locally when PWDEBUG is set
        headless: !process.env.PWDEBUG,
    },
    // The webServer block builds the playground and serves it before tests run
    webServer: {
        command: `yarn build && yarn serve --listen ${PORT} --no-clipboard`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
