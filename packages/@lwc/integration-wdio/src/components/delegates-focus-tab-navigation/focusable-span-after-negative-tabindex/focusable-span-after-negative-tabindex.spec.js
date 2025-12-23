/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Delegates focus', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should focus the input when clicked', async () => {
        const first = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.first');
        await first.click();

        await browser.keys(['Tab']); // tab over integration-child

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'span'); // flaky
    });
});
