/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed focusout event', () => {
    const URL = '/focusout-composed-true';

    before(async () => {
        await browser.url(URL);
    });

    it('standard event should be composed', async () => {
        const input = await browser.shadowDeep$('integration-focusout-composed-true', 'input');

        await input.click();
        const body = await $('body');
        await body.click();

        const focusInComposed = await browser.shadowDeep$(
            'integration-focusout-composed-true',
            '.focus-out-composed'
        );
        assert.strictEqual(await focusInComposed.getText(), 'Focus Out Composed');
    });
    it('custom event should not be composed', async () => {
        const button = await browser.shadowDeep$('integration-focusout-composed-true', 'button');
        await button.click();

        const customFocusInNotComposed = await browser.shadowDeep$(
            'integration-focusout-composed-true',
            '.custom-focus-out-not-composed'
        );
        assert.strictEqual(
            await customFocusInNotComposed.getText(),
            'Custom Focus Out Not Composed'
        );
    });
});
