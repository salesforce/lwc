/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Event target in slot elements', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should receive event with correct target', async () => {
        const select = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'select');
        await select.selectByIndex(1); // Second option (0-indexed)

        const element = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.target-is-select');

        assert.strictEqual(await element.getText(), 'Event Target is select element');
    });
});
