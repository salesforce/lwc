/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should skip shadow (forward)', async () => {
        const secondInput = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-negative',
            '.second-outside'
        );
        await secondInput.click();
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');
    });

    it('should skip shadow (backward)', async () => {
        const thirdInput = await browser.shadowDeep$(
            'integration-tab-navigation-tabindex-negative',
            '.third-outside'
        );
        await thirdInput.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'second-outside');
    });
});
