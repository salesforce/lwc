/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('basic invocation', () => {
    it('should focus on the first programmatically focusable element', async () => {
        const button = await browser.shadowDeep$('integration-basic', 'button');
        await button.click();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'internal-input');
    });
});
