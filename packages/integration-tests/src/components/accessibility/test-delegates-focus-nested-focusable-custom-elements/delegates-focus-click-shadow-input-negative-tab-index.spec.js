/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-nested-focusable-custom-elements';

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', function () {
        browser.click('.focusable-span');
        const active = browser.execute(function () {
            return document.querySelector('integration-delegates-focus-nested-focusable-custom-elements').shadowRoot.querySelector('integration-parent').shadowRoot.activeElement;
        });
        assert.equal(active.getTagName(), 'span');
    });
});
