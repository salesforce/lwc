/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed change event', () => {
    const URL = '/change-event-composed/';

    before(async () => {
        await browser.url(URL);
    });

    it('should be composed: false', async () => {
        // Force native "change" event to fire
        await browser.execute(function () {
            document
                .querySelector('integration-change-event-composed')
                .shadowRoot.querySelector('input')
                .focus();
        });

        await browser.keys('foo');
        const body = await $('body');
        await body.click();

        const div = await browser.$(function () {
            return document
                .querySelector('integration-change-event-composed')
                .shadowRoot.querySelector('.verify-not-composed');
        });
        assert.strictEqual(await div.getText(), 'Not Composed');
    });
});
