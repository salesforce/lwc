/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/noop-when-already-focused';

describe('when the shadow already contains the active element', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should not change the currently focused element', async () => {
        const input = await browser.shadowDeep$(
            'integration-noop-when-already-focused',
            'integration-child',
            'input'
        );
        await input.click();

        const target = await browser.$('integration-noop-when-already-focused');
        await target.focus();

        const className = await browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.strictEqual(className, 'child-input');
    });

    it('should result in the same focused element when invoked twice', async () => {
        const target = await browser.$('integration-noop-when-already-focused');
        await target.focus();
        await target.focus();

        const className = await browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.strictEqual(className, 'first');
    });
});
