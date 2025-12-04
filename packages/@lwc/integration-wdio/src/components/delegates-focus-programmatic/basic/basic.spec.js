/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('basic invocation', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should focus on the first programmatically focusable element', async () => {
        const button = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'button');
        await button.click();

        const activeElement = await browser.activeElementShadowDeep();
        assert.strictEqual(await activeElement.getAttribute('class'), 'internal-input');
    });
});
