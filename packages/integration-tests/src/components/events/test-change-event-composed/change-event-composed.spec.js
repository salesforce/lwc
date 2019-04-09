/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Composed change event', () => {
    const URL = 'http://localhost:4567/change-event-composed/';

    before(() => {
        browser.url(URL);
    });

    it('should be composed: false', function() {
        // Force native "change" event to fire
        browser.execute(function() {
            document
                .querySelector('integration-change-event-composed')
                .shadowRoot.querySelector('input')
                .focus();
        });
        browser.keys('foo');
        browser.click('body');
        assert.deepEqual(browser.getText('.verify-not-composed'), 'Not Composed');
    });
});
