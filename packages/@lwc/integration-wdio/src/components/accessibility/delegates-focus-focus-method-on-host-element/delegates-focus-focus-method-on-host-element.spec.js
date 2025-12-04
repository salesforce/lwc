/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Invoking the focus method of a host element', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should apply focus to the host element (tabindex -1)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'input');
        await input.click();

        const target = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-button.negative'
        );
        await target.focus();

        const root = await browser.$(`integration-${TEST_NAME}`);
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'negative');
    });

    it('should apply focus to the host element (tabindex 0)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'input');
        await input.click();

        const target = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-button.zero'
        );
        await target.focus();

        const root = await browser.$(`integration-${TEST_NAME}`);
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'zero');
    });

    it('should apply focus to the host element (no tabindex)', async () => {
        // Click the top input to give the focus event's relatedTarget a
        // non-null value so that we enter the code path that we want to test.
        const input = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'input');
        await input.click();

        const target = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-button.none'
        );
        await target.focus();

        const root = await browser.$(`integration-${TEST_NAME}`);
        const hostActiveElement = await root.activeElementShadow();
        assert.strictEqual(await hostActiveElement.getAttribute('class'), 'none');
    });
});
