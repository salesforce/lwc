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
        const input = await browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('input');
        });

        await input.click();
        const body = await $('body');
        await body.click();

        const focusInComposed = await browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('.focus-out-composed');
        });
        assert.strictEqual(await focusInComposed.getText(), 'Focus Out Composed');
    });
    it('custom event shoud not be composed', async () => {
        const button = await browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('button');
        });
        await button.click();
        const customFocusInNotComposed = await browser.$(function () {
            return document
                .querySelector('integration-focusout-composed-true')
                .shadowRoot.querySelector('.custom-focus-out-not-composed');
        });
        assert.strictEqual(
            await customFocusInNotComposed.getText(),
            'Custom Focus Out Not Composed'
        );
    });
});
