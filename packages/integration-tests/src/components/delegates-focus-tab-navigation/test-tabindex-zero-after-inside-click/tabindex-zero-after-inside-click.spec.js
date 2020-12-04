/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-after-inside-click';

describe('Tab navigation when tabindex 0 after inside click', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should continue delegating focus (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-zero-after-inside-click',
            'integration-child',
            '.second-inside'
        );
        await secondInside.click();
        const secondOutside = await browser.shadowDeep$(
            'integration-tabindex-zero-after-inside-click',
            '.second-outside'
        );
        await secondOutside.click();

        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });

    it('should continue delegating focus (backward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-zero-after-inside-click',
            'integration-child',
            '.second-inside'
        );
        await secondInside.click();
        const thirdOutside = await browser.shadowDeep$(
            'integration-tabindex-zero-after-inside-click',
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-inside');
    });
});
