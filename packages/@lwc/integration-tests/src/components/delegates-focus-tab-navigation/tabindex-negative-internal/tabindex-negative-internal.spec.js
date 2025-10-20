/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative-internal';

describe('Internal tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should navigate (forward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-internal',
            'integration-child',
            '.second-inside'
        );
        await secondInside.click();
        await browser.keys(['Tab']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-inside');
    });

    it('should navigate (backward)', async () => {
        const secondInside = await browser.shadowDeep$(
            'integration-tabindex-negative-internal',
            'integration-child',
            '.second-inside'
        );
        await secondInside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });
});
