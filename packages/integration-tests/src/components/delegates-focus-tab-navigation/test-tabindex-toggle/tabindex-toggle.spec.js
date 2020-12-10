/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-toggle';

describe('Tab navigation without tabindex', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should support tabindex toggling', async () => {
        const secondOutside = await browser.shadowDeep$(
            'integration-tabindex-toggle',
            '.second-outside'
        );
        await secondOutside.click();
        await browser.keys(['Tab']);

        let activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');

        // Toggle the tabindex <x-child tabindex="-1">
        const toggle = await browser.shadowDeep$('integration-tabindex-toggle', '.toggle');
        await toggle.click();

        await secondOutside.click();
        await browser.keys(['Tab']);

        activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'third-outside');

        // Toggle the tabindex <x-child>
        await toggle.click();

        await secondOutside.click();
        await browser.keys(['Tab']);

        activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'first-inside');
    });
});
