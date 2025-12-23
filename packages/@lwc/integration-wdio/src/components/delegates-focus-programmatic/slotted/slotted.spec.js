/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('when the first focusable element is slotted', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should apply focus to slotted element', async () => {
        const first = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.first');
        await first.click();

        const target = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'integration-child');
        await target.focus();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), `${TEST_NAME}-input`);
    });
});
