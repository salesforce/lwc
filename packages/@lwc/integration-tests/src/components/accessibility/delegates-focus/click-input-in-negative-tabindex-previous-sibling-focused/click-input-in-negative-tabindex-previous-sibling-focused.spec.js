/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

// The bug: Cannot click into the first child of a shadow root when the active element is
// the previous sibling to the custom element

describe('Delegates focus', () => {
    const URL = '/delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused';

    before(async () => {
        await browser.url(URL);
    });

    it('should focus the input when clicked', async () => {
        await browser.keys(['Tab']); // focus first anchor
        await browser.keys(['Tab']); // focus second anchor
        const input = await browser.shadowDeep$(
            'integration-delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused',
            'integration-child',
            'input'
        );

        await input.click();

        const active = await browser.activeElementShadowDeep();
        assert.strictEqual(await active.getTagName(), 'input');
    });
});
