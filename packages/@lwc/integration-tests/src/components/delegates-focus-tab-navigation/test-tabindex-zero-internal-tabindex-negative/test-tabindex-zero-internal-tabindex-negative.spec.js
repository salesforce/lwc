/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-internal-tabindex-negative';

describe('Tab navigation when tabindex 0', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (forward)', async () => {
        const firstInput = await browser.shadowDeep$(
            'integration-tabindex-zero-internal-tabindex-negative',
            '.first'
        );
        await firstInput.click();

        await browser.keys(['Tab']);

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input');
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (backward)', async () => {
        const lastInput = await browser.shadowDeep$(
            'integration-tabindex-zero-internal-tabindex-negative',
            '.last'
        );
        await lastInput.click();

        await browser.keys(['Shift', 'Tab', 'Shift']);

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input');
    });
});
