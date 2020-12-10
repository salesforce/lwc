/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = '/retarget-related-target';

    before(async () => {
        await browser.url(URL);
    });

    it('should retarget relatedTarget from a foreign shadow', async () => {
        const target = await browser.shadowDeep$(
            'integration-retarget-related-target',
            'integration-child',
            'input'
        );
        await target.focus();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        const indicator = await browser.shadowDeep$(
            'integration-retarget-related-target',
            '.related-target-tabname'
        );
        assert.strictEqual(await indicator.getText(), 'integration-child');
    });
});
