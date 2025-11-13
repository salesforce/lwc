/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('Retarget relatedTarget', () => {
    before(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should retarget relatedTarget from slotted custom element', async () => {
        const target = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-child',
            '.child-input'
        );
        await target.focus();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const indicator = await browser.shadowDeep$(
            `integration-${TEST_NAME}`,
            'integration-parent',
            '.related-target-tagname'
        );
        assert.strictEqual(await indicator.getText(), 'integration-child');
    });
});
