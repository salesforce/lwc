/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/slotted';

describe('when the first focusable element is slotted', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus to slotted element', async () => {
        const first = await browser.shadowDeep$('integration-slotted', '.first');
        await first.click();

        const target = await browser.shadowDeep$('integration-slotted', 'integration-child');
        await target.focus();

        const className = await browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.strictEqual(className, 'slotted-input');
    });
});
