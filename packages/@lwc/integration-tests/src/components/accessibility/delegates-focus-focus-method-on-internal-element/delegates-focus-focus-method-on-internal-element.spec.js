/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-focus-method-on-internal-element';

describe('Invoking the focus method on an element inside a shadow tree', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus (tabindex -1)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            '.head'
        );
        await input.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            'integration-button.negative'
        );
        await target.focus();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getTagName(), 'button');
    });

    it('should apply focus (tabindex 0)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const head = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            '.head'
        );
        await head.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            'integration-button.zero'
        );
        await target.focus();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getTagName(), 'button');
    });

    it('should apply focus (no tabindex)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const head = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            '.head'
        );
        await head.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-internal-element',
            'integration-button.none'
        );
        await target.focus();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getTagName(), 'button');
    });
});
