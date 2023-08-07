/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Delegates focus', () => {
    const URL = '/focusable-span-after-negative-tabindex';

    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should focus the input when clicked', async () => {
        const first = await browser.shadowDeep$(
            'integration-focusable-span-after-negative-tabindex',
            '.first'
        );
        await first.click();

        await browser.keys(['Tab']); // tab over integration-child

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'span');
    });
});
