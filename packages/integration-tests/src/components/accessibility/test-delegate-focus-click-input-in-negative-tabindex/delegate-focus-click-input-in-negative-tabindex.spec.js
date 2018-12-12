/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Delegates focus', () => {
    const URL = 'http://localhost:4567/delegate-focus-click-input-in-negative-tabindex';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser.keys(['Tab']); // focus first anchor
        browser.click('input'); // click into input
        const active = browser.execute(function () {
            return document.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.equal(active.getTagName(), 'input');
    });
});
