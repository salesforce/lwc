/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = '/retarget-slotted-custom-element-related-target';

    before(async () => {
        await browser.url(URL);
    });

    it('should retarget relatedTarget from slotted custom element', async () => {
        const target = await browser.shadowDeep$(
            'integration-retarget-slotted-custom-element-related-target',
            'integration-child',
            '.child-input'
        );
        await target.focus();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const indicator = await browser.shadowDeep$(
            'integration-retarget-slotted-custom-element-related-target',
            'integration-parent',
            '.related-target-tagname'
        );
        assert.strictEqual(await indicator.getText(), 'integration-child');
    });
});
