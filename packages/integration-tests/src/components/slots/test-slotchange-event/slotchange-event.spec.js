/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/slotchange-event';

describe('slotchange', () => {
    before(() => {
        browser.url(URL);
    });

    // We didn't migrate this one to integration-karma because we couldn't it
    // get it to pass using native shadow in Safari
    it('should be dispatched on initial render if a slotchange listener has been added to the slot', () => {
        const count = browser.execute(function() {
            var container = document.querySelector('integration-slotchange-event');
            var child = container.shadowRoot.querySelector('integration-child');
            return child.shadowRoot.querySelector('.count').textContent;
        });
        assert.strictEqual(count, '1');
    });
});
