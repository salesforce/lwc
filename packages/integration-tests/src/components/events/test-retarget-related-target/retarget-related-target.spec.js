/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/retarget-related-target';

describe('Retarget relatedTarget', () => {
    before(() => {
        browser.url(URL);
    });

    it('should retarget relatedTarget for MouseEvent', () => {
        var first = browser.$(function () {
            return document
                .querySelector('integration-retarget-related-target')
                .shadowRoot.querySelector('integration-child.first')
                .shadowRoot.querySelector('input');
        });
        var second = browser.$(function () {
            return document
                .querySelector('integration-retarget-related-target')
                .shadowRoot.querySelector('integration-child.second')
                .shadowRoot.querySelector('input');
        });
        var indicator = browser.$(function () {
            return document
                .querySelector('integration-retarget-related-target')
                .shadowRoot.querySelector('.related-target-class-name');
        });

        first.moveTo();
        second.moveTo();

        assert.strictEqual(indicator.getText(), 'undefined, first');
    });
});
