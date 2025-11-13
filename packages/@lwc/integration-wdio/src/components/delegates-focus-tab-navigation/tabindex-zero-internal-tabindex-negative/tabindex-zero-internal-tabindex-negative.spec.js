/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Tab navigation when tabindex 0', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (forward)', async () => {
        const firstInput = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.first');
        await firstInput.click();

        await browser.keys(['Tab']);

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input'); // flaky
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (backward)', async () => {
        const lastInput = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.last');
        await lastInput.click();

        await browser.keys(['Shift', 'Tab', 'Shift']);

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input'); // flaky
    });
});
