/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed change event', () => {
    const URL = '/change-event-composed/';

    before(() => {
        browser.url(URL);
    });

    it('should be composed: false', function () {
        // Force native "change" event to fire
        browser.execute(function () {
            document
                .querySelector('integration-change-event-composed')
                .shadowRoot.querySelector('input')
                .focus();
        });
        browser.keys('foo');
        $('body').click();
        const div = browser.$(function () {
            return document
                .querySelector('integration-change-event-composed')
                .shadowRoot.querySelector('.verify-not-composed');
        });
        assert.deepEqual(div.getText(), 'Not Composed');
    });
});
