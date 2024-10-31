/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should skip shadow (forward)', async () => {
        const secondOutside = await browser.shadowDeep$(
            'integration-tabindex-negative',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Tab']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');
    });

    it('should skip shadow (backward)', async () => {
        const thirdOutside = await browser.shadowDeep$(
            'integration-tabindex-negative',
            '.third-outside'
        );
        await thirdOutside.click();
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick
        await browser.keys(['Shift', 'Tab', 'Shift']);
        await browser.execute(() => new Promise(requestAnimationFrame)); // wait a tick

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'second-outside');
    });
});
