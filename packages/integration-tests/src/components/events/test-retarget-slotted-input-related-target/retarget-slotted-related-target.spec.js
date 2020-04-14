/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = '/retarget-slotted-input-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should have correct relatedTarget from slotted input', () => {
        browser.execute(function () {
            document
                .querySelector('integration-retarget-slotted-input-related-target')
                .shadowRoot.querySelector('.slotted-input')
                .focus();
        });
        browser.keys(['Shift', 'Tab', 'Shift']);
        const indicator = browser.$(function () {
            return document
                .querySelector('integration-retarget-slotted-input-related-target')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('.related-target-tagname');
        });
        assert.equal(indicator.getText(), 'input');
    });
});
