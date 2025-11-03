/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Composed change event', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should be composed: false', async () => {
        // Force native "change" event to fire
        const input = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'input');
        await input.focus();

        await browser.keys('foo');
        const body = await $('body');
        await body.click();

        const div = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.verify-not-composed');
        assert.strictEqual(await div.getText(), 'Not Composed');
    });
});
