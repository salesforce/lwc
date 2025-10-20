/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/delegates-focus-focus-method-on-host-element';

describe('Invoking the focus method of a host element', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus to the host element (tabindex -1)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'input'
        );
        await input.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'integration-button.negative'
        );
        await target.focus();

        const root = await browser.$('integration-delegates-focus-focus-method-on-host-element');
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'negative');
    });

    it('should apply focus to the host element (tabindex 0)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'input'
        );
        await input.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'integration-button.zero'
        );
        await target.focus();

        const root = await browser.$('integration-delegates-focus-focus-method-on-host-element');
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'zero');
    });

    it('should apply focus to the host element (no tabindex)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'input'
        );
        await input.click();

        const target = await browser.shadowDeep$(
            'integration-delegates-focus-focus-method-on-host-element',
            'integration-button.none'
        );
        await target.focus();

        const root = await browser.$('integration-delegates-focus-focus-method-on-host-element');
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'none');
    });
});
