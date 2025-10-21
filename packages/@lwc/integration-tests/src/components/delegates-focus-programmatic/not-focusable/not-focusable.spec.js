/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const { basename } = require('node:path');
const TEST_NAME = basename(__filename, '.spec.js');

describe('when there are no focusable elements in the shadow', () => {
    beforeEach(async () => {
        await browser.url('/' + TEST_NAME);
    });

    it('should not change the currently focused element', async () => {
        const first = await browser.shadowDeep$(`integration-${TEST_NAME}`, '.first');
        await first.click();

        const target = await browser.shadowDeep$(`integration-${TEST_NAME}`, 'integration-child');
        await target.focus();

        const className = await browser.execute(function () {
            return document.activeElement.shadowRoot.activeElement.className;
        });
        assert.strictEqual(className, 'first');
    });
});
