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
    const URL =
        'http://localhost:4567/delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused';

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function() {
        browser.keys(['Tab']); // focus first anchor
        browser.keys(['Tab']); // focus second anchor
        const input = browser.execute(function() {
            return document
                .querySelector(
                    'integration-delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused'
                )
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('input');
        });
        input.click(); // click into input
        const active = browser.execute(function() {
            return document
                .querySelector(
                    'integration-delegate-focus-click-input-in-negative-tabindex-previous-sibling-focused'
                )
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.equal(active.getTagName(), 'input');
    });
});
