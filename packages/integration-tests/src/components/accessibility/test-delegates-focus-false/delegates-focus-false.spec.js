/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-false';

    before(async () => {
        await browser.url(URL);
    });

    it('should not apply focus to input in shadow', async () => {
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);
        const activeFromDocument = await browser.$(function () {
            return document.activeElement;
        });
        assert.strictEqual(
            await activeFromDocument.getTagName(),
            'integration-delegates-focus-false'
        );

        const activeFromShadow = await browser.$(function () {
            return document.querySelector(
                'integration-delegates-focus-false'
            ).shadowRoot.activeElement;
        });
        assert.strictEqual(await activeFromShadow.getTagName(), 'integration-child');

        await browser.keys(['Tab']);
        await browser.keys(['Tab']);
        const activeFromShadowAfter = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-false')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.strictEqual(await activeFromShadowAfter.getTagName(), 'input');
    });
});
