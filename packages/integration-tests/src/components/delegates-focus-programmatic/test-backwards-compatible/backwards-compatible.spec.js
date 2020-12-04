/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/backwards-compatible';

describe('when the component overrides the focus method', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should continue custom focus behavior', async () => {
        const target = await browser.shadowDeep$(
            'integration-backwards-compatible',
            'integration-child'
        );
        await target.focus();

        const className = await browser.execute(function () {
            var active = document.activeElement;
            while (active.shadowRoot) {
                active = active.shadowRoot.activeElement;
            }
            return active.className;
        });
        assert.strictEqual(className, 'internal-textarea');
    });
});
