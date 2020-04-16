/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Retarget relatedTarget', () => {
    const URL = '/retarget-body-related-target';

    before(() => {
        browser.url(URL);
    });

    it('should have correct relatedTarget when body was focused', () => {
        browser.execute(function () {
            document.body.focus();
        });
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const indicator = browser.$(function () {
            return document
                .querySelector('integration-retarget-body-related-target')
                .shadowRoot.querySelector('.related-target-tagname');
        });
        assert.equal(indicator.getText(), 'body');
    });
});
