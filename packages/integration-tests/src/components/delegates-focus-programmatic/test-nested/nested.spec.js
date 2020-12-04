/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/nested';

describe('when the only focusable element is in a nested shadow', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should apply focus in the nested shadow', async () => {
        const button = await browser.shadowDeep$('integration-nested', 'button');
        await button.click();

        const className = await browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.strictEqual(className, 'child-input');
    });
});
