/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('when the only focusable element is in a nested shadow', () => {
    it('should apply focus in the nested shadow', async () => {
        const button = await browser.shadowDeep$('integration-nested', 'button');
        await button.click();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'child-input');
    });
});
