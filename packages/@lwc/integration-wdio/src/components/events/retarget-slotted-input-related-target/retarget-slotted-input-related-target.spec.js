/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('node:assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should have correct relatedTarget from slotted input', async () => {
        const slottedInput = await browser.shadowDeep$(
            'integration-retarget-slotted-input-related-target',
            '.slotted-input'
        );
        await slottedInput.focus();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const indicator = await browser.shadowDeep$(
            'integration-retarget-slotted-input-related-target',
            'integration-parent',
            '.related-target-tagname'
        );
        assert.strictEqual(await indicator.getText(), 'input');
    });
});
