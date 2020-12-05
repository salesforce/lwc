/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Delegates focus', () => {
    it('should focus the input when clicked', async () => {
        const bottom = await browser.shadowDeep$(
            'integration-shift-tab-into-negative-tabindex',
            '.bottom'
        );
        await bottom.click();

        await browser.keys(['Shift', 'Tab', 'Shift']); // tab backwards over integration-child

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'top');
    });
});
