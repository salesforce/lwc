/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { test, expect } from '@playwright/test';

test.describe('LWC Playground', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders "Hello world!" heading', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText('Hello world!');
    });

    test('renders Counter component', async ({ page }) => {
        // The counter label and initial value should both be visible
        const body = page.locator('body');
        await expect(body).toContainText('Counter:');
        await expect(body).toContainText('0');
    });

    test('counter increments from 0 to 1 on click', async ({ page }) => {
        const body = page.locator('body');

        // Confirm the initial counter value is 0
        await expect(body).toContainText('0');

        // Click the increment button (labeled "+")
        const incrementBtn = page.locator('button', { hasText: '+' });
        await incrementBtn.click();

        // Counter should now show 1
        await expect(body).toContainText('1');
    });
});
